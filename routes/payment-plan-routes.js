const express = require('express');
const router = express.Router();
const paymentPlanController = require('../controller/Payment-plan-controller.js');
const authMiddleWare = require('../middleware/authMiddleware.js');

router.post('/create-payment-plan', paymentPlanController.createPaymentPlan);
// router.post('/buy-plan', authMiddleWare, paymentPlanController.buyPlan);
router.post('/downloadBook',  paymentPlanController.downloadBook);
router.get('/gell-all-payment-plans', paymentPlanController.getAllPaymentPlans);
router.put('/update-payment-plan/:id', paymentPlanController.updatePaymentPlan);
router.get('/check-payment-plan/:userId', paymentPlanController.getCheckPaymentPlan);

// // Route to buy a new plan and remove the previous one
// // router.post('/buy-new-plan', authMiddleWare, paymentPlanController.buyNewPlan);
// // Route to check and renew plans automatically (this would typically be called by a scheduled job)
// router.post('/renew-plan', paymentPlanController.renewPlan);
router.delete('/delete-payment-plan/:id', paymentPlanController.deletePaymentPlan);
// // router.get('/books/:id', paymentPlanController.getBookById);

module.exports = router;
