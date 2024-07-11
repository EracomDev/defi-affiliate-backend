// models/activity.js
const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
    wallet_name: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 }
});

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, },
    debit_credit: { type: String, },
    use_wallet: {
        type: [walletSchema],
        validate: {
            validator: function (wallets) {
                const totalPercentage = wallets.reduce((acc, curr) => acc + curr.percentage, 0);
                return totalPercentage === 100;
            },
            message: props => `Sum of percentages in use_wallet must be 100, but it is not.`
        }
    },
    status: { type: Number, default: 1 },
    allowed_for: [{ type: String, required: true }],
    act_id: { type: Number, unique: true, required: true }
});


const Activity = mongoose.model('Activity', activitySchema);

const act = [
    {
        name: 'bet',
        description: 'Activity to bet a game',
        type: 'expenses',
        debit_credit: 'debit',
        use_wallet: [
            {
                wallet_name: 'main_wallet',
                percentage: 70
            },
            {
                wallet_name: 'fund_wallet',
                percentage: 30
            },
        ],
        status: 1,
        allowed_for: ['user',],
        act_id: 1 
    },
    {
        name: 'topup',
        description: 'Activity to topup a id',
        type: 'expenses',
        debit_credit: 'debit',
        use_wallet: [
            {
                wallet_name: 'main_wallet',
                percentage: 60
            },
            {
                wallet_name: 'fund_wallet',
                percentage: 30
            },
            {
                wallet_name: 'repurchase_wallet',
                percentage: 10
            },
        ],
        status: 1,
        allowed_for: ['user'],
        act_id: 2
    },
    {
        name: 'roi',
        description: 'ROI Activity',
        type: 'income',
        debit_credit: 'credit',
        use_wallet: [
            {
                wallet_name: 'main_wallet',
                percentage: 60
            },
            {
                wallet_name: 'fund_wallet',
                percentage: 30
            },
            {
                wallet_name: 'repurchase_wallet',
                percentage: 10
            },

            // You can add more wallets here, but the sum of the percentages for each wallet must equal 100%.
        ],
        status: 1,
        allowed_for: ['user'],
        act_id: 3 
    },
    {
        name: 'win',
        description: 'Win Activity',
        type: 'income',
        debit_credit: 'credit',
        use_wallet: [
            {
                wallet_name: 'main_wallet',
                percentage: 60
            },
            {
                wallet_name: 'fund_wallet',
                percentage: 40
            }
            // You can add more wallets here, but the sum of the percentages for each wallet must equal 100%.
        ],
        status: 1,
        allowed_for: ['user'],
        act_id: 4 
    },
    {
        name: 'add_fund',
        description: 'Payment Activity',
        type: 'topup',
        debit_credit: 'credit',
        use_wallet: [
            {
                wallet_name: 'main_wallet',
                percentage: 60
            },
            {
                wallet_name: 'fund_wallet',
                percentage: 40
            }
            // You can add more wallets here, but the sum of the percentages for each wallet must equal 100%.
        ],
        status: 1,
        allowed_for: ['user'],
        act_id: 5
    },
    {
        name: 'withdraw',
        description: 'Withdraw Activity',
        type: 'withdraw',
        debit_credit: 'debit',
        use_wallet: [
            {
                wallet_name: 'main_wallet',
                percentage:100
            }
        ],
        status: 1,
        allowed_for: ['user'],
        act_id: 6
    },

]
async function saveActivity() {
    try {
        const ttl_activity = await Activity.find().count();
        if (ttl_activity == 0) {
            await Activity.insertMany(act)
        }
    } catch (error) {
        console.log(error)
    }
}
saveActivity()
module.exports = Activity;
