const express = require('express');
const router = express.Router();
const contactController = require('../controller/BookController.js');


router.get('/get-all-newly-edit-books', contactController.newlyEdit);



module.exports = router;
