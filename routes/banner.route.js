const express = require('express');
// const authMiddleware = require('../middleware/authMiddleware'); // Remove destructuring if it's default export
const bannerController = require('../controller/Banner-Api.controller.js')


const router = express.Router();



router.post('/create-banner',  bannerController.createBannerApi);
router.get('/get-all-banners', bannerController.getBannerApi);
router.delete('/delete-banner-book/:id', bannerController.deletebannerBooks);

module.exports = router;