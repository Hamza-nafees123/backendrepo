const express = require("express");
const bookController = require("../controller/Recently-Read-Controller.js");
const middleware = require("../middleware/authMiddleware.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
// const path = require('path');
// const fs = require('fs');

const uploadMiddleware = upload.fields([
  { name: "bookCoverImage", maxCount: 1 },
  { name: "pdfUpdate", maxCount: 1 },
  { name: "epubUpload", maxCount: 1 },
  { name: "kindleMobiUpload", maxCount: 1 },
]);

const router = express.Router();

// Define routes for books
router.post(
  "/create-recently-read-book",
  middleware.authMiddleware,
  bookController.createRecentlyReadBook
);
router.get(
  "/get-all-recently-read-book/",
  middleware.authMiddleware,
  bookController.getAllRecentlyReadBook
);
router.delete(
  "/delete-recently-read/:id",
  // middleware.authMiddleware,
  bookController.deleteRecentlyRead
);

module.exports = router;
