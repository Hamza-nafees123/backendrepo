const express = require('express');
// const authMiddleware = require('../middleware/authMiddleware'); // Remove destructuring if it's default export
const recommendedController = require('../controller/Recommended-Controller.js')


const router = express.Router();



// router.post('/create-recommended-book',  recommendedController.createRecommendedBook);
router.get('/get-all-recommended-book', recommendedController.getAllRecommendedBook);
// // router.delete('/delete-recommended-book/:id', recommendedController.deleteRecommendedBook);

module.exports = router;