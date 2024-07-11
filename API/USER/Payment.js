const PaymentOption = require("../../MODALS/PaymentOption");
const Transaction = require("../../MODALS/transactions");
const { INTERNAL_SERVER_ERROR, INVALID_TRANSACTION_ID } = require("../../utils/errorMessages");
const { REQUEST_SUCCESS } = require("../../utils/successMessages");

class PAYMENT{
    async getPaymentOptions(req,res) {
        try {
            const options = await PaymentOption.findOne();
            if (!options) {
               return res.status(301).json({message:'Payment options not found'});
            }
            
            // Filter out inactive options and methods
            const activeOptions = {
                manual: {
                    status: options.manual.status,
                    upi: options.manual.upi.filter(option => option.status),
                    bank: options.manual.bank.filter(option => option.status)
                },
                api: {
                    status: options.api.status,
                    providers: options.api.providers.filter(option => option.status)
                },
                web3: {
                    status: options.web3.status,
                    chains: options.web3.chains.filter(option => option.status)
                }
            };
    
            return res.status(200).json({activeOptions});
        } catch (error) {
            console.error(error);
            return res.status(501).json({...INTERNAL_SERVER_ERROR});
        }
    }
    async submitPaymentRequest(req, res) {
        try {
            const {uid} = req.user;
            const { amount,transaction_id } = req.body;
            let hostName = req.headers.host;
            const proofUrl = "https://" + hostName + "/" + `${req.file.filename}`;
            const existingTransaction = await Transaction.findOne({ reqest_tx_Id: transaction_id });
            if (existingTransaction) {
                return res.status(400).json({ ...INVALID_TRANSACTION_ID });
            }

            if (!proofUrl) {
                return res.status(400).json({ message: 'Payment proof is required' });
            }

            const transaction = new Transaction({
                uid,
                to_from: 'admin',
                tx_type: 'add_fund',
                debit_credit: 'credit',
                wallet_type: 'main_wallet',
                amount,
                status: 0, // Pending approval
                reqest_tx_Id:transaction_id,
                proofUrl
            });

          const result = await transaction.save();

            res.status(201).json({ ...REQUEST_SUCCESS, result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
    async paymentRequest(req,res){
        try {
            const {uid} = req.user;
            const paymentRequests = await Transaction.find({tx_type:'add_fund',uid});
            res.status(200).json({ paymentRequests });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ...INTERNAL_SERVER_ERROR });
        }
    }
}
const paymentController  = new PAYMENT();
module.exports = paymentController;