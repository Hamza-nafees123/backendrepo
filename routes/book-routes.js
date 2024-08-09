const express = require("express");
const bookController = require("../controller/BookController");
// const middleware = require("../middleware/authMiddleware.js");

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
  { name: "compressedFile", maxCount: 1 },
]);

const router = express.Router();

// Define routes for books
router.post("/create-book", uploadMiddleware, bookController.createBook);
router.put("/update-book/:id", uploadMiddleware, bookController.updateBook);
router.get("/get-book", bookController.getAllBooks);
router.get("/get-genres", bookController.getGenres);
router.get("/series", bookController.series);
router.get("/get-all-spot-books", bookController.getAllSpotBooks);
router.get("/get-all-romace-books", bookController.getAllRomanceBooks);
router.get("/get-all-dark-17-books", bookController.getAllDarkBooks);
router.get("/get-all-young-adult-books", bookController.getAllYoungAdultBooks);
router.get("/get-all-billionaire-books", bookController.getAllBillionaireBooks);
router.get("/get-all-scifi-books", bookController.getAllSciFiBooks);
router.get(
  "/get-all-historicalRomance-books",
  bookController.getAllHistoricalRomanceBooks
);
router.get("/get-all-lGBTQ-books", bookController.getAllLGBTQBooks);
router.get(
  "/get-all-fictionfantasy-books",
  bookController.getAllFictionFantasyBooks
);
router.get(
  "/get-all-thrillersuspense-books",
  bookController.getAllThrillerSuspenseBooks
);
router.get("/audio-books", bookController.audioBooks);
router.get("/get-all-newly-edit", bookController.newlyEdit);
router.get("/get-all-top-books/", bookController.getAllTopsBooks);
router.get("/get-all-top-books/:id", bookController.incrementClickCount);
router.get("/get-all-books-single-category/:id", bookController.getBookById);
router.get("/get-all-related-book-api", bookController.relatedBookApi);
router.put("/updatebook/:bookId", bookController.updateBook);
router.delete("/delete-book/:id", bookController.deleteBook);

module.exports = router;
