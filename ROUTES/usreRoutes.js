const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const profile = require("../API/USER/profile");
const { getAllRoutes, getAuthRoutes } = require("../utils/get-all-routes");
const GAME = require("../API/GAME/gameClass");
const authenticator = require("../utils/authuser");
const paymentController = require("../API/USER/Payment");
const upload = require("../utils/upload");
const balance = require("../API/USER/balances");
const runGame = require("../SERVICES/game");
const transaction = require("../SERVICES/Transaction");
const Html_Page = require("../SERVICES/HTMLpages");
const withdraw = require("../API/USER/Withdarw");
var u_router = express.Router();
var jsonParser = bodyParser.json();
u_router.use(jsonParser);
const corsOptions = {
  origin: '*', // Replace with your React app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
u_router.use(cors(corsOptions));
u_router.use(bodyParser.urlencoded({ extended: false }));
u_router.use((req,res,next)=>authenticator.authenticateToken(req,res,next,'user'));
// u_router.use(authenticator.authenticate.bind(authenticator));
u_router.post('/register', profile.register);
u_router.post('/register-with-dap', profile.registerWithDap);
u_router.post('/login-with-dap', profile.loginWithDap);
u_router.post('/login', profile.login);
u_router.post('/update-password', profile.updatePassword);
u_router.post('/get_all_games',GAME.all_games);
u_router.get('/get_all_providers',GAME.getProvider);
u_router.post('/game_init',GAME.game_init);
u_router.get('/get_profile',profile.get_profile);
u_router.get('/get_wallets',balance.getAllWallets);
u_router.get('/get_page',Html_Page.Get_page);

u_router.get('/get-payment-method',paymentController.getPaymentOptions);
u_router.post('/payment-request',upload.single('proof'),paymentController.submitPaymentRequest);
u_router.get('/get-payment-transaction',transaction.getTransactions);
u_router.post('/withdraw',withdraw.withdarw)

// const routes = getAuthRoutes(u_router)


// console.log(routes)



module.exports = u_router;