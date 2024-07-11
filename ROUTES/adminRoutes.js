const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const authenticator = require("../utils/authuser");
const AdminController = require("../API/ADMIN/AdminController");
const PaymentAction = require("../API/ADMIN/PaymentOptions");
const Dashboard = require("../API/ADMIN/Dashboard");
const transaction = require("../SERVICES/Transaction");
var admin = express.Router();
var jsonParser = bodyParser.json();
admin.use(jsonParser);
const corsOptions = {
  origin: '*', // Replace with your React app's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
admin.use(cors(corsOptions));
admin.use(bodyParser.urlencoded({ extended: false }));
admin.use((req,res,next)=>authenticator.authenticateToken(req,res,next,'admin'));
admin.post('/login',AdminController.login);
admin.get('/save_payment_option',PaymentAction.seedPaymentOptions);
admin.get('/all-payment-request',PaymentAction.allPaymentRequest);
admin.post('/approve-payment-request',PaymentAction.approvePaymentRequests);
admin.post('/reject-payment-request',PaymentAction.rejectPaymentRequests);
admin.get('/get-dashboard-data',Dashboard.getStats);
admin.get('/get-payment-transaction',transaction.getTransactions);



module.exports = admin;