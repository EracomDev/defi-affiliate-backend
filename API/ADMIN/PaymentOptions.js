const PaymentOption = require("../../MODALS/PaymentOption");
const Transaction = require("../../MODALS/transactions");
const transaction = require("../../SERVICES/Transaction");
const { INTERNAL_SERVER_ERROR, INVALID_REQUEST } = require("../../utils/errorMessages");

class PAYMENT {
    async seedPaymentOptions(req, res) {
        try {
            const paymentOptions = new PaymentOption({
                manual: {
                    upi: [
                        { name: 'UPI Name 1', upiId: 'upi1@bank' },
                        { name: 'UPI Name 2', upiId: 'upi2@bank' }
                    ],
                    bank: [
                        { bankName: 'Bank 1', accountNumber: '1234567890', ifsc: 'IFSC0001',holder:"Game Pitara",ac_type:"Saving" ,branch:"zirakpur"},
                        { bankName: 'Bank 2', accountNumber: '0987654321', ifsc: 'IFSC0002',holder:"Game Pitara2",ac_type:"Current" ,branch:"Mohali" }
                    ]
                },
                api: {
                    providers: [
                        { name: 'coinpayment', details: 'Details for CoinPayment' },
                        { name: 'payumoney', details: 'Details for PayUMoney' },
                        { name: 'razorpay', details: 'Details for Razorpay' },
                        { name: 'paypal', details: 'Details for PayPal' }
                    ]
                },
                web3: {
                    chains: [
                        { chain: 'bep20', address: '0xBEp20Address' },
                        { chain: 'trc20', address: 'TTrc20Address' }
                    ]
                }
            });

            // Save all payment options
            const result = await paymentOptions.save();

            res.status(200).json({ result });
            console.log('Payment options seeded');
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    };
    async allPaymentRequest(req,res){
        try {
            // Fetch all payment requests from the database
            const paymentRequests = await Transaction.find({tx_type: 'add_fund'});
    
            // Send the payment requests as a response
            res.status(200).json({ paymentRequests });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
    async approvePaymentRequests(req, res) {
        try {
            const { requestIds } = req.body;
    
            // Validate request
            if (!Array.isArray(requestIds) || requestIds.length === 0) {
                return res.status(400).json({ ...INVALID_REQUEST, message: 'Request IDs must be provided in an array.' });
            }
    
            // Update the status of the specified payment requests
            const transactions = await Transaction.find({tx_Id: { $in: requestIds } ,status:0});
            for (let index = 0; index < transactions.length; index++) {
                const {tx_Id} = transactions[index];
                await transaction.updateWallet(tx_Id,1);
            }
          
            // Send success response
            res.status(200).json({ message: 'Payment requests approved successfully.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
    async rejectPaymentRequests(req, res) {
        try {
            const { requestIds } = req.body;
    
            // Validate request
            if (!Array.isArray(requestIds) || requestIds.length === 0) {
                return res.status(400).json({ ...INVALID_REQUEST, message: 'Request IDs must be provided in an array.' });
            }
    
            // Update the status of the specified payment requests to 'rejected'
            await Transaction.updateMany(
                { _id: { $in: requestIds },status:0 },
                { $set: { status: 2 } }
            );
    
            // Send success response
            res.status(200).json({ message: 'Payment requests rejected successfully.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
}

const PaymentAction = new PAYMENT();
module.exports = PaymentAction;
