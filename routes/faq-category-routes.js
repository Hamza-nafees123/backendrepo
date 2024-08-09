const express = require('express');
const router = express.Router();
const faqsController = require('../controller/Faqs-Controller.js');
// const authMiddleWare = require('../middleware/authMiddleware.js');

router.post('/create-faq-category', faqsController.addFaqCategory);
router.get('/gell-all-faq-category', faqsController.getAllFaqCategory);
router.put('/update-faq-category/:id', faqsController.updateFaqCategory);
router.delete('/delete-faq-category/:id', faqsController.deleteFaqCategory);

module.exports = router;
