const express = require('express');
// const authMiddleware = require('../middleware/authMiddleware'); // Remove destructuring if it's default export
const audioBookController = require('../controller/Audio-book-controller.js')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// // Multer configuration for file storage
// const storageConfig = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadDir = path.join(__dirname, '../uploads'); // Corrected upload directory path
//         // Check if directory exists, if not create it
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         // console.log('Multer file:', file);
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const uploadMiddleware = multer({ storage: storageConfig });

// Multer configuration for file storage
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Configure Multer to accept specific fields
const upload = multer({
    storage: storageConfig,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit
}).fields([
    { name: 'imageUpload', maxCount: 1 },
    { name: 'uploadAudio', maxCount: 1 }
]);



const router = express.Router();



router.post('/create', upload, audioBookController.createAudioBook);
router.get('/get-all', audioBookController.getAllAudioBooks);
router.put('/update/:id', upload, audioBookController.updateAudioBook);
router.delete('/single-delete/:id', audioBookController.deleteAudioBooks);

module.exports = router;