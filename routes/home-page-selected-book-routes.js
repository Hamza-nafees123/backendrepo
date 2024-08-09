const express = require('express');
const homePageSelectedController = require('../controller/Home-Page-Selected-Page-Controller.js');
const router = express.Router();



// Define routes for books
router.post('/create-home-page-selected-banner', homePageSelectedController.homePageSelectedRomance);
router.delete('/delete-home-page-selected-banner/:id', homePageSelectedController.deletebannerBooks);

module.exports = router;
