const express = require('express');
// const authMiddleware = require('../middleware/authMiddleware'); // Remove destructuring if it's default export
const audioBookController = require('../controller/Audio-book-controller.js')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
// const path = require('path');
// const fs = require('fs');

const uploadMiddleware = upload.fields([
    { name: 'imageUpload', maxCount: 1 },
    { name: 'uploadAudio', maxCount: 1 }
]);



const router = express.Router();



router.post('/create-audio', uploadMiddleware, audioBookController.createAudioBook);
router.get('/get-all', audioBookController.getAllAudioBooks);
router.put('/update/:id', uploadMiddleware, audioBookController.updateAudioBook);
router.delete('/single-delete/:id', audioBookController.deleteAudioBooks);

module.exports = router;