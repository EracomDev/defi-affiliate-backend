const Activity = require("../../MODALS/Activity");
const UserWallet = require("../../MODALS/userWallets");
const transaction = require("../../SERVICES/Transaction");
const { INVALID_AMOUNT, INSUFFICIENT_FUND } = require("../../utils/errorMessages");
const { REQUEST_SUCCESS } = require("../../utils/successMessages");

class WITHDRAW {

    async withdarw(req,res){
        try {
            const {amount,currency}  = req.body;
            const {uid}  = req.user;
        console.log(amount)

        if(!amount || amount <= 0){
            res.status(400).json({...INVALID_AMOUNT}
            )
        }
            const { use_wallet, status, debit_credit,name:activityName } = await Activity.findOne({ name: "withdraw" });

            const walletNames = use_wallet.map(wallet => wallet.wallet_name);

               const userWallets = await UserWallet.aggregate([
                { $match: { uid } }, // Match documents with the specified uid
                { $unwind: '$wallets' }, // Deconstruct the wallets array
                { $match: { 'wallets.slug': { $in: walletNames } } }, // Match wallets with the specified slugs
                { $group: { _id: '$_id', wallets: { $push: '$wallets' } } } // Group the matching wallets back into an array
            ]);
            
             const { wallets } = userWallets[0];

            const fullBalance = wallets.reduce((total, wallet) => {
                const walletInfo = use_wallet.find(w => w.wallet_name === wallet.slug);
                if (walletInfo) {
                    const allowedAmount = wallet.value * (walletInfo.percentage / 100);
                    return total + allowedAmount;
                }
                return total;
            }, 0);
            const balance = parseFloat(fullBalance).toFixed(5);
            const hasEnoughFunds = use_wallet.every(wallet => {
                const requiredAmount = amount * (wallet.percentage / 100);
                const correspondingWallet = wallets.find(w => w.slug === wallet.wallet_name);
                return correspondingWallet && correspondingWallet.value >= requiredAmount;
            });
            if(amount > balance && hasEnoughFunds){
                res.status(400).json({...INSUFFICIENT_FUND});
            }else{
                 const transactionData = use_wallet.map(wallet => ({
                             uid,
                             to_from: uid,
                             tx_type: activityName,
                             debit_credit,
                             wallet_type: wallet.wallet_name,
                             amount: amount * (wallet.percentage / 100),
                             source:activityName,
                             currency
                         }));
                         const saved = await transaction.insert(transactionData);

                         res.status(200).json({
                            ...REQUEST_SUCCESS
                         })
            }        
    
        } catch (error) {
            console.error("withdarw",error)
        }
    }


}
const withdraw = new WITHDRAW();

module.exports = withdraw;