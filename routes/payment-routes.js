const express = require('express');
const { buyAndProcessPayment, cancelMembership, getAllCancelMemberShip, getAllRemaningBooks } = require('../controller/PaymentController.js');

const router = express.Router();

// router.post('/buy-and-process-payment', buyAndProcessPayment); // Payment processing endpoint
router.post('/cancel-membership', cancelMembership); // Membership cancellation endpoint
router.get('/get-all-cancel-member-ship', getAllCancelMemberShip); // getAllCancelMemberShip all users details
router.get('/get-all-remaning-dowloads/:id', getAllRemaningBooks); // getAllCancelMemberShip all users details

module.exports = router;
