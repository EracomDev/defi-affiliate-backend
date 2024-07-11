const mongoose = require('mongoose');
const Wallets = require('./wallets');
const defaultWallet=[]

async function defaultWalletFun() {
    const wallets = await Wallets.find({status:1})
    wallets.map((item,ind)=>{
        defaultWallet.push({
            name:item.name,
            wallet_type:item.wallet_type,
            slug:item.slug,
            count_in:item.count_in
        })
    })
}
defaultWalletFun()
const walletSchema = new mongoose.Schema({
    name: { type: String, default: "Main Wallet" },
    wallet_type: { type: String, default: "wallet" },
    wallet_status: { type: Number, default: 1 },
    value: { type: Number, default: 0 },
    updated_on: { type: Date, default: null },
    slug:{type:String},
    count_in:{type:String}
});

const userWalletSchema = new mongoose.Schema({
    uid: {
        type: Number,
        required: true,
        unique:true
    },
    wallets: {
        type: [walletSchema], // Array of wallet objects
        default:defaultWallet
    }
});

const UserWallet = mongoose.model('UserWallet', userWalletSchema);

module.exports = UserWallet;
