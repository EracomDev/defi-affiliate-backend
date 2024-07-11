const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    name: { type: String},
    wallet_type: { type: String},
    status: { type: Number},
    slug: { type: String},
    count_in: { type: String, default: null }
});
const wallets = [
    {
        name: "Main Wallet",
        wallet_type: "wallet",
        status:1,
        slug:'main_wallet',
        count_in:null
    },
    {
        name: "Fund Wallet",
        wallet_type: "wallet",
        status:1,
        slug:'fund_wallet',
        count_in:null
    },
    {
        name: "Direct Income",
        wallet_type: "income",
        status:0,
        slug:'direct_income',
        count_in:'main_wallet'
    },
    {
        name: "Level Income",
        wallet_type: "income",
        status:0,
        slug:'level_income',
        count_in:'main_wallet'
    },
    {
        name: "Total direct",
        wallet_type: "team",
        status:0,
        slug:'total_direct',
        count_in:null
    },
    {
        name: "Active direct",
        wallet_type: "team",
        status:0,
        slug:'active_direct',
        count_in:null
    },
    {
        name: "Inactive direct",
        wallet_type: "team",
        status:0,
        slug:'inactive_direct',
        count_in:null
    },
    {
        name: "Total generation",
        wallet_type: "team",
        status:0,
        slug:'total_generation',
        count_in:null
    },
    {
        name: "Active generation",
        wallet_type: "team",
        status:0,
        slug:'active_generation',
        count_in:null
    },
    {
        name: "Total Withdrawal",
        wallet_type: "withdrawal",
        status:0,
        slug:'total_withdrawal',
        count_in:null
    },
    {
        name: "Total Payout",
        wallet_type: "payout",
        status:0,
        slug:'total_payout',
        count_in:null
    },
];
const Wallets = mongoose.model('Wallets', walletSchema);
async function has_wallet(){
    const has_wallet = await Wallets.find().count();
    if (has_wallet==0) {
        Wallets.insertMany(wallets);
    }
}
module.exports = Wallets;
has_wallet();
// module.exports = Wallets;
