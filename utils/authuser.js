const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const user_api_key = process.env.USER_API_KEY;
const user_merchant_key = process.env.USER_MERCHANT_KEY;
const CryptoJS = require('crypto-js');
const { MISSING_AUTH_TOKEN, TOKEN_EXPIRED, FORBIDDEN } = require('./errorMessages');
const merchantKey = process.env.MERCHANT_KEY;
class Authenticator {
    constructor() {
        this.apiKeys = new Map();
        this.usedNonces = new Set();
        this.userPermissions = {
            read: ['/api/resource'],
            write: ['/api/resource', '/api/modify'],
        };
    }
     generateSignature(queryString, merchantKey) {
        const hmac = CryptoJS.HmacSHA256(queryString, merchantKey);
        return CryptoJS.enc.Base64.stringify(hmac);
    }
    authenticate(req, res, next) {
        const apiKey = req.headers['x-api-key'];
        const timestamp = parseInt(req.headers['x-timestamp'], 10);
        const nonce = req.headers['x-nonce'];
        const signature = req.headers['x-sign'];
        if (user_api_key === apiKey) {
            const currentTime = Math.floor(Date.now() / 1000);
            const timestampWindow = 60;
            if (Math.abs(currentTime - timestamp) > timestampWindow) {
                return res.status(401).send('Unauthorized: Timestamp is not within acceptable range');
            }
            if (this.usedNonces.has(nonce)) {
                return res.status(401).send('Unauthorized: Nonce has already been used');
            }
            const headers = {
                'x-api-key': req.headers['x-api-key'],
                'X-Timestamp': req.headers['x-timestamp'],
                'X-Nonce': req.headers['x-nonce'],
            };
            const mergedParams = Object.assign({}, req.body, headers);
            const sortedParams = Object.keys(headers).sort().reduce((obj, key) => {
                obj[key] = headers[key];
                return obj;
            }, {});
            const queryString = new URLSearchParams(sortedParams).toString();
            const expectedSign = this.generateSignature(queryString, user_merchant_key)
            console.log(signature,expectedSign)
            if (signature !== expectedSign) {
                return res.status(401).send('Unauthorized: Invalid signature');
            }
            next()
        } else {
            res.status(401).send('Unauthorized');
        }
    }

async authenticateToken(req, res, next,router) {
    const token = req.headers.authorization;
    const allowedPaths = ['/register','/register-with-dap','/login-with-dap','/login', '/get_all_games','/webhooks/slotegrator/v1/transactions/execute','/get_all_providers','/get_page'];
    if (allowedPaths.includes(req.path)) {
        next(); // Skip authentication for /register route
        return;
   }
   console.log(req.path)
    if (!token) {
        return res.status(401).json({...MISSING_AUTH_TOKEN});
    }
    const secretKey = process.env.JWT_KEY;
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({...TOKEN_EXPIRED});
        }
        req.user = decoded;
        if (decoded.role !== router) {
           return res.status(403).json({...FORBIDDEN});
        }
        next();
    });
}
async SlotegratorAuth(req,res,next){
    // console.log('object here',req.body)
    try {
        const headers = {
            'X-Merchant-Id': req.headers['x-merchant-id'],
            'X-Timestamp': req.headers['x-timestamp'],
            'X-Nonce': req.headers['x-nonce'],
        };
        const mergedParams = Object.assign({}, req.body, headers);
        const sortedParams = Object.keys(mergedParams).sort().reduce((obj, key) => {
            obj[key] = mergedParams[key];
            return obj;
        }, {});
        const queryString = new URLSearchParams(sortedParams).toString();
        const hmac = crypto.createHmac('sha1', merchantKey);
        hmac.update(queryString);
        const expectedSign = hmac.digest('hex');
        if (req.headers['x-sign'] !== expectedSign) {
            console.log('expectedSign',expectedSign,req.headers['x-sign']);
            console.log('x-sign');
            return res.status(200).json({
                error_code: 'INTERNAL_ERROR',
                error_description: 'Invalid signature'
            });
        }else{
            if (req.body && req.body['rollback_transactions[0][transaction_id]']) {
                const rollbackTransactions = [];
                let index = 0;
        
                while (req.body[`rollback_transactions[${index}][transaction_id]`]) {
                    rollbackTransactions.push({
                        action: req.body[`rollback_transactions[${index}][action]`],
                        amount: req.body[`rollback_transactions[${index}][amount]`],
                        transaction_id: req.body[`rollback_transactions[${index}][transaction_id]`],
                        type: req.body[`rollback_transactions[${index}][type]`],
                    });
                    index++;
                }
        
                req.body.rollback_transactions = rollbackTransactions;
            }
            next()
        }
      
    } catch (error) {
        console.log(error)
    }
}
}

const authenticator = new Authenticator();
module.exports = authenticator;
// // Apply authentication middleware to relevant routes
// app.use('/api/resource', authenticator.authenticate.bind(authenticator));
// app.use('/api/modify', authenticator.authenticate.bind(authenticator));

// // Define your API endpoints
// app.get('/api/resource', (req, res) => {
//     res.send('Resource accessed successfully');
// });

// app.post('/api/modify', (req, res) => {
//     console.log('Data received:', req.body);
//     res.send('Resource modified successfully');
// });

// Route to generate API key and secret for a new user


// Start the server
// const port = 3000;
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });
