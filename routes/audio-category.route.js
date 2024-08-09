const express = require('express');
// const authMiddleware = require('../middleware/authMiddleware'); // Remove destructuring if it's default export
const audioBookController = require('../controller/Audio-Category.controller')
const router = express.Router();



router.post('/create-audio-book', audioBookController.createAudioBook);
router.get('/get-audio-book', audioBookController.getAllAudioBooks);
router.delete('/delete-audio-book/:id', audioBookController.deleteAudioBooks);

module.exports = router;