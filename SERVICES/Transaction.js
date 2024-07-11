const Transaction = require("../MODALS/transactions");
const UserData = require("../MODALS/userData");
const UserWallet = require("../MODALS/userWallets");


class TRANSACTION {
    async insert(transactionData) {
        try {
            // Array to store all saved transactions
            const savedTransactions = [];
            const tx_count = await Transaction.find().countDocuments()
            // Iterate over each transaction in transactionData
            for (let index = 0; index < transactionData.length; index++) {
                const element = transactionData[index];
                const { uid, order_Id, source } = element;

                // Save transaction to the database
                if (element.amount > 0) {

                    const transaction = new Transaction({
                        tx_Id: tx_count + index + 1,
                        ...element
                    })
                    const savedTransaction = await transaction.save();
                    savedTransactions.push(savedTransaction);

                    // Update wallets for the saved transaction
                    await this.updateWallet(savedTransaction.tx_Id, 1);
                }
            }

            // Return all saved transactions
            return savedTransactions;
        } catch (error) {
            // Handle error
            console.error('Error saving transactions:', error);
            throw error;
        }
    }

    async update(query, data) {
        try {
            const updated = await Transaction.updateMany(query, data, { new: true });
            const updatedDocuments = await Transaction.find(query);
            for (let index = 0; index < updatedDocuments.length; index++) {
                const { tx_Id } = updatedDocuments[index];
                this.updateWallet(tx_Id, 2)
            }
            // console.log('==================',updatedDocuments)
            return updatedDocuments;
        } catch (error) {
            console.log(error)
        }
    }
    async updateWallet(tx_Id, status) {
        const { uid, wallet_type: slug, amount, debit_credit, order_Id, source } = await Transaction.findOne({ tx_Id, status: 0 })
        if (!uid || !slug || !amount || !debit_credit) {
            return;
        }
        try {
                  // Retrieve transaction details
        const orderTransaction = order_Id
        ? await Transaction.findOne({ uid, status: 1, order_Id, source }).sort({ updatedAt: -1 })
        : null;
    
    const sourceTransaction = await Transaction.findOne({ uid, status: 1, source }).sort({ updatedAt: -1 });
    const overallTransaction = await Transaction.findOne({ uid, status: 1 }).sort({ updatedAt: -1 });

    const close_ord = orderTransaction?.close_ord || 0;
    const close_src = sourceTransaction?.close_src || 0;
    const overall_close = overallTransaction?.overall_close || 0;
            const { wallets } = await UserWallet.findOne({ uid, 'wallets.slug': slug }, { 'wallets.$': 1 });
            if (!wallets || wallets[0].value == 0) {
                return;
            }
            let newValue;
            if (debit_credit == 'credit') {
                newValue = (Number(wallets[0].value) + Number(amount))
            } else {
                newValue = (Number(wallets[0].value) - Number(amount))
            }
            const updatedUserWallet = await UserWallet.findOneAndUpdate(
                { uid, 'wallets.slug': slug }, // Find the document with matching uid and 'main_wallet' slug
                { $set: { 'wallets.$.value': newValue } }, // Update the value of the main_wallet
                { new: true } // Return the updated document
            );
            const { count_in } = wallets[0]
            if (count_in !== null) {
                const { wallets } = await UserWallet.findOne({ uid, 'wallets.slug': count_in }, { 'wallets.$': 1 });
                let newValue_count;
                let amt;
                if (debit_credit == 'credit') {
                    amt = amount;
                    newValue_count = (Number(wallets[0].value) + Number(amount))
                } else {
                    amt = (-amount);
                    newValue_count = Number(wallets[0].value) - Number(amount)
                }
                const updatedUserWallet = await UserWallet.findOneAndUpdate(
                    { uid, 'wallets.slug': count_in }, // Find the document with matching uid and 'main_wallet' slug
                    { $set: { 'wallets.$.value': newValue_count } }, // Update the value of the main_wallet
                    { new: true } // Return the updated document
                );
            }
            await Transaction.findOneAndUpdate(
                { tx_Id, status: 0 },
                {
                    status,
                    open_ord: close_ord,
                    close_ord: close_ord + amount,
                    open_src: close_src,
                    close_src: close_src + amount,
                    overall_open: overall_close,
                    overall_close: overall_close + ((debit_credit === 'credit') ? amount : -amount)
                }
            );
            return updatedUserWallet;
        } catch (error) {
            console.error('Error updating main wallet:', error);
            throw error;
        }

    }
    async getTransactions(req, res) {
        try {
            const { uid, role } = req.user; // Assuming user information is attached to req.user
            const { page = 1, limit = 10, search, startDate, endDate, ...filters } = req.query;

            const query = {};

            // Restrict to user's own transactions if not admin

            // Apply additional filters
            for (const key in filters) {
                if (filters[key]) {
                    query[key] = new RegExp(filters[key], 'i'); // Case-insensitive filtering
                }
            }
            if (role !== 'admin') {
                query.uid = uid;
            }

            // Date range filtering
            if (startDate || endDate) {
                query.time = {};
                if (startDate) {
                    query.time.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
                }
                if (endDate) {
                    query.time.$lt = new Date(new Date(endDate).setHours(23, 59, 59, 999));
                }
            }

            // If search term is provided, find matching users
            if (search) {
                const userSearchRegex = new RegExp(search, 'i');
                const matchingUsers = await UserData.find({
                    $or: [
                        { user_name: userSearchRegex },
                        { name: userSearchRegex }
                    ]
                }, 'uid');
                const matchingUserIds = matchingUsers.map(user => user.uid);

                if (role === 'admin') {
                    // For admin, filter by matching user IDs
                    query.uid = { $in: matchingUserIds };
                } else {
                    // For regular users, ensure search only includes their own transactions
                    query.uid = {
                        $in: matchingUserIds,
                        $eq: uid
                    };
                }
            }

            // Find transactions
            const transactions = await Transaction.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const totalCount = await Transaction.countDocuments(query);

            // Calculate sum of debit and credit transactions
            const debitSum = await Transaction.aggregate([
                { $match: { ...query, debit_credit: 'debit' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const creditSum = await Transaction.aggregate([
                { $match: { ...query, debit_credit: 'credit' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            let transactionData = transactions;

            // If role is admin, include username and name
            if (role === 'admin') {
                const userIds = transactions.map(tx => tx.uid);
                const users = await UserData.find({ uid: { $in: userIds } }, 'uid user_name name');
                const userMap = users.reduce((acc, user) => {
                    acc[user.uid] = user;
                    return acc;
                }, {});
                transactionData = transactions.map(tx => ({
                    ...tx.toObject(),
                    user_name: userMap[tx.uid]?.user_name,
                    name: userMap[tx.uid]?.name
                }));
            }

            res.status(200).json({
                success: true,
                data: transactionData,
                totalRecords: totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                debitSum: debitSum[0]?.total || 0,
                creditSum: creditSum[0]?.total || 0
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

}
const transaction = new TRANSACTION()
module.exports = transaction;
