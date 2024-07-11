const mongoose = require('mongoose');

const PaymentOptionSchema = new mongoose.Schema({
    manual: {
        status: { type: Boolean, default: true }, // Active by default
        upi: [
            {
                name: String,
                upiId: String,
                status: { type: Boolean, default: true } // Active by default
            }
        ],
        bank: [
            {
                bankName: String,
                accountNumber: String,
                ifsc: String,
                holder:String,
                ac_type:String,
                branch:String,
                status: { type: Boolean, default: true } // Active by default
            }
        ]
    },
    api: {
        status: { type: Boolean, default: true }, // Active by default
        providers: [
            {
                name: String,
                details: String, // Details or configuration if needed
                status: { type: Boolean, default: true } // Active by default
            }
        ]
    },
    web3: {
        status: { type: Boolean, default: true }, // Active by default
        chains: [
            {
                chain: String,
                address: String,
                status: { type: Boolean, default: true } // Active by default
            }
        ]
    }
});

module.exports = mongoose.model('PaymentOption', PaymentOptionSchema);
