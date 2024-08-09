const express = require('express');
const router = express.Router();
const faqsQuestionController = require('../controller/Faqs-question-controller.js');
// const authMiddleWare = require('../middleware/authMiddleware.js');

router.post('/create-faq-question', faqsQuestionController.addFaqQuestion);
router.get('/gell-all-faq-question', faqsQuestionController.getAllFaqQuestion);
router.get('/get-single-faq-question/:id', faqsQuestionController.getAllFaqSingleIdData);
router.put('/update-faq-question/:id', faqsQuestionController.updateFaqQuestion);
router.delete('/delete-faq-question/:id', faqsQuestionController.deleteFaqQuestion);

module.exports = router;
