const express = require('express');
const favouriteBookController = require('../controller/Favourite-Controller.js');
const middleWare = require('../middleware/authMiddleware.js');
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
// // const path = require('path');
// // const fs = require('fs');

// const uploadMiddleware = upload.fields([
//     { name: 'bookCoverImage', maxCount: 1 },
//     { name: 'pdfUpdate', maxCount: 1 },
//     { name: 'epubUpload', maxCount: 1 },
//     { name: 'kindleMobiUpload', maxCount: 1 },
// ]);

const router = express.Router();



// Define routes for books
router.post('/create-favourite-book', favouriteBookController.addFavouriteBook);
router.get('/get-single-favourite-book', middleWare.authMiddleware, favouriteBookController.getAllFavouriteBook);
router.delete('/delete-favourite-book/:id', favouriteBookController.deleteFavouriteBook);

module.exports = router;
