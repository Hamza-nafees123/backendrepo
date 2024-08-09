const mongoose = require("mongoose");
const AudioBook = require("../models/Audio-Books.Model.js");
// const book = require('../models/BookModel.js');
const audioBookCategory = require("../models/Audio-Category-Model.js");
const { uploadCloudinary, deleteImgCloudinary } = require("../cloudinary.js");
// const path = require('path');
// const fs = require('fs');

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
      rating, // Assuming rating is optional
    } = req.body;

    // console.log("req.body: ", req.body);

    // Check if primaryCategoryId and secondaryCategoryId are provided
    if (!primaryCategory || !secondaryCategory) {
      return res.status(400).json({
        success: false,
        message: "Primary category and secondary category IDs are required.",
      });
    }

    // Fetch primary category details
    const primaryCategoryData = await audioBookCategory.findOne({
      _id: primaryCategory,
    });
    if (!primaryCategoryData) {
      return res.status(404).json({
        success: false,
        message: "Primary category not found.",
      });
    }
    console.log("primaryCategoryData :", primaryCategoryData);

    // Fetch secondary category details
    const secondaryCategoryData = await audioBookCategory.findOne({
      _id: secondaryCategory,
    });
    if (!secondaryCategoryData) {
      return res.status(404).json({
        success: false,
        message: "Secondary category not found.",
      });
    }
    console.log("secondaryCategoryData :", secondaryCategoryData);

    const { imageUpload, uploadAudio } = req.files;
    console.log("imageUpload, uploadAudio :", req.files);

    // if (!imageUpload && !uploadAudio) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "No files were uploaded.",
    //   });
    // }

    let uploadedAvatar = null;
    console.log("uploadedAvatar :", uploadedAvatar);

    let AudioUploaded = null;
    console.log("AudioUploaded :", AudioUploaded);

    if (imageUpload && imageUpload[0]) {
      uploadedAvatar = await uploadCloudinary(imageUpload[0].buffer, "image");
    }

    if (uploadAudio && uploadAudio[0]) {
      AudioUploaded = await uploadCloudinary(uploadAudio[0].buffer, "video/mp3" || "video/mp4" || "video/avi");
    }
    if (uploadAudio && uploadAudio[0]) {
      AudioUploaded = await uploadCloudinary(uploadAudio[0].buffer, "audio" || "audio/mpeg" || "audio/wav");
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
      primaryCategory: {
        _id: primaryCategoryData._id,
        name: primaryCategoryData.name,
      },
      secondaryCategory: {
        _id: secondaryCategoryData._id,
        name: secondaryCategoryData.name,
      },
      shortDescription,
      longDescription,
      imageUpload: uploadedAvatar
        ? {
          url: uploadedAvatar.secure_url,
          publicId: uploadedAvatar.public_id,
        }
        : null,
      uploadAudio: AudioUploaded
        ? {
          url: AudioUploaded.secure_url,
          publicId: AudioUploaded.public_id,
        }
        : null,
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
      savedAudioBook,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create audio book",
      error: error.message, // Optional: Send detailed error message
    });
  }
};

// const getAllAudioBooks = async (req, res, next) => {
//   try {
//     const audioBooks = await AudioBook.find().populate(
//       "primaryCategory secondaryCategory",
//       "id name"
//     );
//     console.log("get all audio books", audioBooks);

//     if (audioBooks.length === 0) {
//       return res.status(404).json({ message: "No audio books found" });
//     }

//     let totalBookListen = 0; // totalBookListen ko initialize karein
//     let totalBookDownload = 0; // totalBookDownload ko initialize karein

//     res.status(200).json({
//       message: "Get all audio books succesfully",
//       audioBooks,
//     });
//   } catch (error) {
//     console.log("error :", error);
//   }
// };

const getAllAudioBooks = async (req, res, next) => {
  try {
    const audioBooks = await AudioBook.find().populate(
      "primaryCategory secondaryCategory",
      "id name"
    );
    console.log("get all audio books", audioBooks);

    if (audioBooks.length === 0) {
      return res.status(404).json({ message: "No audio books found" });
    }

    // Initialize counters
    let totalBookListen = 0;
    let totalBookDownload = 0;

    //map function ka use karke har book ka listens aur downloads count ko totalBookListen aur totalBookDownload mein add kiya gaya hai.
    //Har book ke object mein totalBookListen aur totalBookDownload fields ko add kiya gaya hai,
    // jo individual book ka listens aur downloads values ko show karengi.

    // Add listens and downloads to each book
    const updatedAudioBooks = audioBooks.map((book) => {
      totalBookListen += book.listens || 0;
      totalBookDownload += book.downloads || 0;

      return {
        ...book._doc,
        totalBookListen: book.listens || 0,
        totalBookDownload: book.downloads || 0,
      };
    });
    console.log("updatedAudioBooks: ", updatedAudioBooks);

    res.status(200).json({
      message: "Get all audio books successfully",
      audioBooks: updatedAudioBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching audio books" });
  }
};

const updateAudioBook = async (req, res) => {
  var audioBookId = req.params.id;
  console.log("audioBookId: ", audioBookId);
  const {
    bookTitle,
    authorName,
    primaryCategory,
    secondaryCategory,
    shortDescription,
    longDescription,
    rating,
  } = req.body;
  console.log("audioBood: ", req.body);

  if (!mongoose.isValidObjectId(audioBookId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid audio book id" });
  }

  //Hum check kar rahe hain ke audioBookId valid hai ya nahi.
  //Agar valid nahi hai toh response mein error message bhej rahe hain:

  const book = await AudioBook.findById(audioBookId);
  console.log("book: ", book);

  if (!book) {
    return res
      .status(404)
      .json({ success: false, message: "Audio book not found" });
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
        uploadedAvatar = await uploadCloudinary(imageUpload[0].buffer, "image/jpeg" || "image/png" || "image");
        updatedData.imageUpload = {
          url: uploadedAvatar.secure_url,
          publicId: uploadedAvatar.public_id,
        };
      }

      if (uploadAudio && uploadAudio[0]) {
        if (book.uploadAudio && book.uploadAudio.publicId) {
          await deleteImgCloudinary(book.uploadAudio.publicId);
        }
        uploadedAudio = await uploadCloudinary(
          uploadAudio[0].buffer,
          "audio" || "audio/mpeg" || "audio/wav" || "video/mp3" || "video/mp4" || "video/avi" 

        );
        updatedData.uploadAudio = {
          url: uploadedAudio.secure_url,
          publicId: uploadedAudio.public_id,
        };
      }

      console.log("uploadedAvatar: ", uploadedAvatar);
      console.log("uploadedAudio: ", uploadedAudio);
    }

    const updateData = await AudioBook.updateOne(
      { _id: audioBookId },
      { $set: updatedData }
    );

    console.log("updateData: ", updateData);

    res.status(200).json({
      success: true,
      message: "Audio Book Updated Successfully",
      AudioBook,
      updateData
    });
  } catch (error) {
    console.log("updateUserError: ", error);
    res
      .status(500)
      .json({ success: false, message: "Error in updating Audio Book" });
  }
};

// const updateAudioBook = async (req, res) => {
//   try {
//     const audioBookId = req.params.id;
//     console.log("audioBookId: ", audioBookId);
//     const {
//       bookTitle,
//       authorName,
//       primaryCategory,
//       secondaryCategory,
//       shortDescription,
//       longDescription,
//       rating,
//     } = req.body;

//     console.log("audioBook: ", req.body);

//     if (!mongoose.isValidObjectId(audioBookId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid audio book id" });
//     }

//     const book = await AudioBook.findById(audioBookId);
//     console.log("book: ", book);

//     if (!book) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Audio book not found" });
//     }

//     let updatedData = {
//       ...(authorName && { authorName }),
//       ...(bookTitle && { bookTitle }),
//       ...(primaryCategory && { primaryCategory }),
//       ...(secondaryCategory && { secondaryCategory }),
//       ...(shortDescription && { shortDescription }),
//       ...(longDescription && { longDescription }),
//       ...(rating && { rating }),
//     };

//     console.log("updatedData: ", updatedData);

//     if (req.files) {
//       const { imageUpload, uploadAudio } = req.files;
//       console.log("image and audio: ", req.files);

//       if (imageUpload && imageUpload[0]) {
//         if (book.imageUpload && book.imageUpload.publicId) {
//           await deleteImgCloudinary(book.imageUpload.publicId);
//         }
//         const uploadedImage = await uploadCloudinary(
//           imageUpload[0].buffer,
//           "image",
//           "image"
//         );
//         updatedData.imageUpload = {
//           url: uploadedImage.secure_url,
//           publicId: uploadedImage.public_id,
//         };
//       }
//       //   console.log("uploadedImage: ", uploadedImage);

//       if (uploadAudio && uploadAudio[0]) {
//         if (book.uploadAudio && book.uploadAudio.publicId) {
//           await deleteImgCloudinary(book.uploadAudio.publicId);
//         }
//         const uploadedAudio = await uploadCloudinary(
//           uploadAudio[0].buffer,
//           "audio_books",
//           "video" // Cloudinary 'auto' will handle both audio and video
//         );
//         updatedData.uploadAudio = {
//           url: uploadedAudio.secure_url,
//           publicId: uploadedAudio.public_id,
//         };
//       }
//     }
//     // console.log("uploadedAudio: ", uploadedAudio);

//     const updateResult = await AudioBook.updateOne(
//       { _id: audioBookId },
//       { $set: updatedData }
//     );
//     console.log("updateResult: ", updateResult);

//     res.status(200).json({
//       success: true,
//       message: "Audio Book Updated Successfully",
//       updateResult,
//     });
//   } catch (error) {
//     console.error("updateAudioBook Error: ", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

const deleteAudioBooks = async (req, res, next) => {
  try {
    const deletedAudioBook = req.params.id;
    console.log("deletedAudioBook: ", deletedAudioBook);

    // Agar category mil gayi toh delete karo
    await AudioBook.findByIdAndDelete(deletedAudioBook);

    res.status(200).json({ message: "audio book deleted successfully" });
  } catch (error) {
    console.log("error :", error);
  }
};
module.exports = {
  createAudioBook,
  getAllAudioBooks,
  updateAudioBook,
  deleteAudioBooks,
};
