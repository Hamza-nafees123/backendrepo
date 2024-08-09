const mongoose = require('mongoose')
const AudioBook = require('../models/Audio-Books.Model.js');
// const Category = require('../models/CategoryModel');
const { uploadCloudinary, deleteImgCloudinary } = require('../cloudinary.js');
const path = require('path');
const fs = require('fs');


const createAudioBook = async (req, res, next) => {
    try {
        // Extract required fields from request body
        const {
            bookTitle,
            authorName,
            primaryCategory,
            secondaryCategory,
            shortDescription,
            longDescription,
            rating // Assuming rating is optional
        } = req.body;

        // console.log("req.body: ", req.body);

        let imageUpload = {};
        // console.log("imageUpload: ", imageUpload);
        let audioUpload = {};
        // console.log("audioUpload: ", audioUpload);



        if (req?.files && req?.files.length > 0) {
            // Handling book cover image
            const coverImageFile = req?.files?.find(file => file.fieldname === 'imageUpload');
            // console.log("coverImageFile :", coverImageFile);

            if (coverImageFile) {
                const localFilePath = path.join(__dirname, `../uploads/${coverImageFile.filename}`);
                const cloudinaryResult = await uploadToCloudinary(localFilePath);

                if (cloudinaryResult) {
                    imageUpload.url = cloudinaryResult.url;
                    imageUpload.public_id = cloudinaryResult.public_id;
                    fs.unlinkSync(localFilePath); // Delete file after upload
                }
            }


            // Handling audio file
            const audioFile = req?.files?.find(file => file.fieldname === 'uploadAudio');
            // console.log("audioFile :", audioFile);

            if (audioFile) {
                const localAudioPath = path.join(__dirname, `../uploads/${audioFile.filename}`);
                const audioResult = await uploadToCloudinary(localAudioPath);
                // console.log("uploadAudio result:", audioResult);

                if (audioResult) {
                    audioUpload.url = audioResult.url;
                    audioUpload.public_id = audioResult.public_id;
                    fs.unlinkSync(localAudioPath); // Delete file after upload
                }
            }
        }


        // // Check for required fields
        // if (!bookTitle || !authorName || !primaryCategory || !shortDescription || !longDescription || !imageUpload.url || !audioUpload.url) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "All fields are required"
        //     });
        // }


        // Create a new AudioBook instance
        const newAudioBook = new AudioBook({
            bookTitle,
            authorName,
            primaryCategory,
            secondaryCategory,
            shortDescription,
            longDescription,
            imageUpload,
            uploadAudio: audioUpload,
            rating, // Include rating if provided,
            // bookDownload: req.body.bookRead || null, // Handle bookRead field
            // bookListen: req.body.bookDownload || null // Handle bookDownload field
        });
        console.log("newAudioBook: ", newAudioBook);

        // Save the new audio book to the AudioBookbase
        const savedAudioBook = await newAudioBook.save();
        console.log("savedAudioBook: ", savedAudioBook);


        res.status(201).json({
            success: true,
            message: "Audio book created successfully",
            savedAudioBook
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create audio book",
            error: error.message // Optional: Send detailed error message
        });
    }
}
const getAllAudioBooks = async (req, res, next) => {
    try {
        const audioBooks = await AudioBook.find()
            .populate('primaryCategory', 'id name')
            .populate('secondaryCategory', 'id name');
        console.log("audioBooks", audioBooks);

        if (audioBooks.length === 0) {
            return res.status(404).json({ message: "No audio books found" });
        }

        // Calculate totalBookListen and totalBookDownload
        let totalBookListen = null;
        console.log("totalBookListen", totalBookListen);

        let totalBookDownload = null;
        console.log("totalBookDownload", totalBookDownload);


        audioBooks.forEach(book => {
            totalBookListen += book.bookListen || null;
            totalBookDownload += book.bookDownload || null;
        });

        res.status(200).json({
            message: "Get all audio books succesfully", audioBooks, totalBookListen, totalBookDownload
        })


    } catch (error) {
        console.log("error :", error);
    }
}

const updateAudioBook = async (req, res) => {
    var audioBookId = req.params.id;
    console.log("audioBookId: ", audioBookId);
    const { bookTitle, authorName, primaryCategory, secondaryCategory, shortDescription,
        longDescription, rating
    } = req.body;
    console.log("audioBood: ", req.body);

    if (!mongoose.isValidObjectId(audioBookId)) {
        return res.status(400).json({ success: false, message: 'Invalid audio book id' });
    }

    const book = await AudioBook.findOne({ _id: audioBookId });
    console.log("book: ", book);

    if (!book) {
        return res.status(404).json({ success: false, message: 'Audio book not found' });
    }

    try {
        let updatedData = {};
        if (authorName) {
            updatedData.authorName = authorName;
        }
        if (bookTitle) {
            updatedData.bookTitle = bookTitle;
        }
        if (primaryCategory) {
            updatedData.primaryCategory = primaryCategory;
        }
        if (secondaryCategory) {
            updatedData.secondaryCategory = secondaryCategory;
        }
        if (shortDescription) {
            updatedData.shortDescription = shortDescription;
        }
        if (longDescription) {
            updatedData.longDescription = longDescription;
        }
        if (rating) {
            updatedData.rating = rating;
        }



        if (req.files) {
            const { imageUpload, uploadAudio } = req.files;
            console.log("image and audio: ", req.files);

            let uploadedAvatar = null;
            let uploadedAudio = null;

            if (imageUpload && imageUpload[0]) {
                if (book.imageUpload && book.imageUpload.publicId) {
                    await deleteImgCloudinary(book.imageUpload.publicId);
                }
                uploadedAvatar = await uploadCloudinary(imageUpload[0].buffer, 'image');
                updatedData.imageUpload = {
                    url: uploadedAvatar.secure_url,
                    publicId: uploadedAvatar.public_id,
                };
            }

            if (uploadAudio && uploadAudio[0]) {
                if (book.uploadAudio && book.audio.publicId) {
                    await deleteImgCloudinary(book.uploadAudio.publicId);
                }
                uploadedAudio = await uploadCloudinary(uploadAudio[0].buffer, 'video');
                updatedData.uploadAudio = {
                    url: uploadedAudio.secure_url,
                    publicId: uploadedAudio.public_id,
                };
            }

            console.log("uploadedAvatar: ", uploadedAvatar);
            console.log("uploadedAudio: ", uploadedAudio);
        }



        const updateData = await AudioBook.updateOne({ _id: audioBookId }, { $set: updatedData });

        res.status(200).json({ success: true, message: 'Audio Book Updated Successfully', updateData });
    } catch (error) {
        console.log('updateUserError: ', error);
        res.status(500).json({ success: false, message: 'Error in updating Audio Book' });
    }
};

const deleteAudioBooks = async (req, res, next) => {
    try {
        const deletedAudioBook = req.params.id
        console.log("deletedAudioBook: ", deletedAudioBook);

        // Agar category mil gayi toh delete karo
        await AudioBook.findByIdAndDelete(deletedAudioBook);

        res.status(200).json({ message: "audio book deleted successfully" });


    } catch (error) {
        console.log("error :", error);

    }
}
module.exports = {
    createAudioBook,
    getAllAudioBooks,
    updateAudioBook,
    deleteAudioBooks
};
