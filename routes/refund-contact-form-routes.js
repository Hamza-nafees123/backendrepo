const express = require("express");
// const authMiddleware = require('../middleware/authMiddleware'); // Remove destructuring if it's default export
const refundcontactFormController = require("../controller/Refund-contact-form.controller.js");

const router = express.Router();

router.post('/add-refund-contact-form',  refundcontactFormController.addRefundContactForm);
router.get(
  "/get-all-refund-contact-form",
  refundcontactFormController.getAllRefundsContactForm
);
router.delete('/delete-refund-contact-form/:id', refundcontactFormController.deleteRefundContactForm);

module.exports = router;
