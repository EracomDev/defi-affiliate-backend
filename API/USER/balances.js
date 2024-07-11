const { INTERNAL_SERVER_ERROR } = require("authenticate-utils/errorMessages");
const UserWallet = require("../../MODALS/userWallets");

class BALANCE{
    async getAllWallets(req,res){
        try {
            const {uid} = req.user;
            const wallets = await UserWallet.aggregate([
                { $match: { uid } }, // Match documents with the specified uid
                { $unwind: '$wallets' }, // Deconstruct the wallets array
                { $match: { 'wallets.wallet_status': 1 } }, // Match wallets with the specified slugs
                { $group: { _id: '$_id', wallets: { $push: '$wallets' } } } // Group the matching wallets back into an array
            ]);
            // console.log(uid,wallets)
            res.status(200).json(wallets[0])
        } catch (error) {
            console.log(error)
            res.status(500).json({...INTERNAL_SERVER_ERROR})
        }
    }
}
const balance = new BALANCE();
module.exports = balance;