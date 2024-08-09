const RecentlyReadBookSchema = require("../models/Recently-Read-Model.js");
const Book = require("../models/BookModel.js");
const {
  uploadCloudinary,
  deleteImgCloudinary,
  uploadToCloudinary,
} = require("../cloudinary.js");

const createRecentlyReadBook = async (req, res) => {
  try {
    const {
      bookTitle,
      oblicAuthor,
      authorName,
      primaryCategory,
      secondaryCategory,
      series,
      shortDescription,
      longDescription,
      status,
      rating,
      userId,
      bookId,
      bookCoverImage, // Base64 encoded string
      pdfUpdate, // Base64 encoded string
      epubUpload, // Base64 encoded string
      kindleMobiUpload, // Base64 encoded string
    } = req.body;
    // console.log("req.body", req.body);

    const existBookId = await RecentlyReadBookSchema.findOne({ bookId });
    if (existBookId) {
      return res.status(201).json({
        message: "Book read already exist",
      });
    }

    // const { bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload } = req.body;
    // console.log("bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload: ", req.files);

    // let uploadedAvatar = null;
    // let pdfUploaded = null;
    // let epubUploaded = null;
    // let mobiUploaded = null;

    // if (bookCoverImage) {
    //     const base64Image = bookCoverImage.split(';base64,').pop();
    //     const buffer = Buffer.from(base64Image, 'base64');
    //     uploadedAvatar = await uploadCloudinary(buffer, "image/jpeg");
    // }

    // if (pdfUpdate) {
    //     const base64PDF = pdfUpdate.split(';base64,').pop();
    //     const buffer = Buffer.from(base64PDF, 'base64');
    //     pdfUploaded = await uploadCloudinary(buffer, "application/pdf");
    // }

    // if (epubUpload) {
    //     const base64EPUB = epubUpload.split(';base64,').pop();
    //     const buffer = Buffer.from(base64EPUB, 'base64');
    //     epubUploaded = await uploadToCloudinary(buffer, "application/epub+zip");
    // }

    // if (kindleMobiUpload) {
    //     const base64Mobi = kindleMobiUpload.split(';base64,').pop();
    //     const buffer = Buffer.from(base64Mobi, 'base64');
    //     mobiUploaded = await uploadToCloudinary(buffer, "application/vnd.amazon.ebook");
    // }

    // if (bookCoverImage && bookCoverImage[0]) {
    //     uploadedAvatar = await uploadCloudinary(bookCoverImage[0].buffer, "image");
    // }

    // if (pdfUpdate && pdfUpdate[0]) {
    //     pdfUploaded = await uploadCloudinary(pdfUpdate[0].buffer, "raw");
    // }

    // if (epubUpload && epubUpload[0]) {
    //     epubUploaded = await uploadToCloudinary(epubUpload[0].buffer, "application/epub+zip");
    // }

    // if (kindleMobiUpload && kindleMobiUpload[0]) {
    //     mobiUploaded = await uploadToCloudinary(kindleMobiUpload[0].buffer, "application/x-mobipocket-ebook" || "application/vnd.amazon.ebook");
    // }

    // const newBook = new RecentlyReadBookSchema({
    //     bookTitle,
    //     oblicAuthor,
    //     authorName,
    //     primaryCategory,
    //     secondaryCategory,
    //     series,
    //     shortDescription,
    //     longDescription,
    //     bookCoverImage: uploadedAvatar
    //         ? {
    //             url: uploadedAvatar.secure_url,
    //             publicId: uploadedAvatar.public_id,
    //         }
    //         : null,
    //     pdfUpdate: pdfUploaded
    //         ? {
    //             url: pdfUploaded.secure_url,
    //             publicId: pdfUploaded.public_id,
    //         }
    //         : null,
    //     epubUpload: epubUploaded
    //         ? {
    //             url: epubUploaded.secure_url,
    //             publicId: epubUploaded.public_id,
    //         }
    //         : null,
    //     kindleMobiUpload: mobiUploaded
    //         ? {
    //             url: mobiUploaded.secure_url,
    //             publicId: mobiUploaded.public_id,
    //         }
    //         : null,
    //     rating, // Include rating if provided,
    //     status,
    //     userId
    // });

    const newBook = await RecentlyReadBookSchema.create(req.body);
    // console.log("newBook :", newBook);

    // await newBook.save();
    res.status(201).json({
      message: "Recently Read Book created successfully",
      newBook,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllRecentlyReadBook = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user contains authenticated user's details
    console.log("userId :", userId);

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // if (!bookId) {
    //   return res.status(400).json({ message: "Book ID is required" });
    // }

    const books = await RecentlyReadBookSchema.find({ userId })
      .populate("primaryCategory secondaryCategory", "id name")
      .exec(); // Execute query;
    // console.log("books :", books);

    // Agar books milti hain
    if (books.length > 0) {
      return res
        .status(200)
        .json({ message: "Recently read books retrieved successfully", books });
    } else {
      // Agar kisi book nahi milti
      return res.status(404).json({ message: "No books read for this user" });
    }
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ message: err.message });
  }
};

// const getAllRecentlyReadBook = async (req, res) => {
//     try {
//         const userId = req.user._id; // Assuming req.user contains authenticated user's details
//         const { bookId } = req.body;

//         if (!userId) {
//             return res.status(401).json({ message: 'User not authenticated' });
//         }

//         if (!bookId) {
//             return res.status(400).json({ message: 'Book ID is required' });
//         }

//         // Check if the book is already marked as read
//         const existingEntry = await RecentlyReadBookSchema.findOne({ userId, bookId });

//         if (existingEntry) {
//             return res.status(200).json({ message: 'Book already marked as read' });
//         }

//         // Mark the book as read
//         const newReadEntry = new RecentlyReadBookSchema({ userId, bookId });
//         await newReadEntry.save();

//         return res.status(201).json({ message: 'Book marked as read successfully', newReadEntry });
//     } catch (err) {
//         console.error("Error marking book as read:", err);
//         res.status(500).json({ message: err.message });
//     }
// };

const deleteRecentlyRead = async (req, res, next) => {
  try {
    const deletedCouponId = req.params.id;
    console.log("deletedCouponId: ", deletedCouponId);

    const deleteCoupon = await RecentlyReadBookSchema.findByIdAndDelete(
      deletedCouponId
    );
    console.log("deleteCoupon: ", deleteCoupon);

    if (!deleteCoupon) {
      return res.status(404).json({
        message: `Cannot delete recently read with id=${deletedCouponId}. Maybe recently read was not found!`,
      });
    }

    res
      .status(200)
      .json({ message: "recently read deleted successfully", deleteCoupon });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      message: `Could not delete recently read with id=${deletedCouponId}`,
      error: err.message,
    });
  }
};

module.exports = {
  createRecentlyReadBook,
  getAllRecentlyReadBook,
  deleteRecentlyRead
};
