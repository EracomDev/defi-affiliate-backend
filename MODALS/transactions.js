const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    uid: { type: Number, required: true },
    to_from: { type: String, required: true },
    tx_Id: { type: Number, unique: true },
    bet_tx_Id: { type: String, unique: false },
    reqest_tx_Id: { type: String, unique: false,required:false },
    order_Id: { type: Number },
    stake_order_Id: { type: Number, default: null },
    tx_type: { type: String, required: true },
    debit_credit: { type: String, required: true, enum: ['debit', 'credit'] },
    source: { type: String },
    wallet_type: { type: String, required: true },
    level: { type: String },
    level_distribution_status: { type: Number },
    amount: { type: Number, required: true },
    currency: { type: String },
    tx_charge: { type: Number, default: 0 },
    ben_per: { type: Number },
    time: { type: Date, default: Date.now },
    status: { type: Number, default: 0 },
    remark: { type: String },
    proofUrl: { type: String }, // Add this field to store the proof URL
    open_ord: { type: Number, default: 0 },
  close_ord: { type: Number, default: 0 },
  open_src: { type: Number, default: 0 },
  close_src: { type: Number, default: 0 },
  overall_open: { type: Number, default: 0 },
  overall_close: { type: Number, default: 0 }
}, {
    timestamps: true
});

transactionSchema.pre('save', async function (next) {
    try {
        if (!this.tx_Id) {
            const latestTransaction = await this.constructor.findOne({}, {}, { sort: { 'tx_Id': -1 } });
            const lastTxId = latestTransaction ? latestTransaction.tx_Id : 0;
            this.tx_Id = lastTxId + 1;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
