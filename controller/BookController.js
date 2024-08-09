const Book = require("../models/BookModel.js");
const User = require("../models/UserModel.js");
const favouriteSchema = require("../models/Favourite-Model.js");
const newlyEditModel = require("../models/Newly-Edit-Model.js");
const Category = require("../models/CategoryModel");
const RecentlyReadBook = require("../models/Recently-Read-Model.js");
const Genres = require("../models/genre-model");
const mongoose = require("mongoose");
const {
  uploadCloudinary,
  deleteImgCloudinary,
  uploadToCloudinary,
} = require("../cloudinary.js");

const createBook = async (req, res) => {
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
      rating,
      // userId
    } = req.body;

    // Custom file validation
    if (!bookTitle || !bookTitle[0]) {
      return res.status(400).json({
        message: "bookTitle is required",
      });
    }
    if (!oblicAuthor || !oblicAuthor[0]) {
      return res.status(400).json({
        message: "oblicAuthor is required",
      });
    }

    if (!authorName || !authorName[0]) {
      return res.status(400).json({
        message: "authorName is required",
      });
    }

    if (!primaryCategory || !primaryCategory[0]) {
      return res.status(400).json({
        message: "primaryCategory is required",
      });
    }

    if (!secondaryCategory || !secondaryCategory[0]) {
      return res.status(400).json({
        message: "secondaryCategory is required",
      });
    }

    if (!series || !series[0]) {
      return res.status(400).json({
        message: "series is required",
      });
    }

    if (!shortDescription || !shortDescription[0]) {
      return res.status(400).json({
        message: "shortDescription is required",
      });
    }

    if (!longDescription || !longDescription[0]) {
      return res.status(400).json({
        message: "longDescription is required",
      });
    }

    if (!rating || !rating[0]) {
      return res.status(400).json({
        message: "rating is required",
      });
    }

    const { bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload } =
      req.files;
    // console.log("bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload: ", req.files);
    // console.log("bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload: ", req.files);

    // Custom file validation
    if (!bookCoverImage || !bookCoverImage[0]) {
      return res.status(400).json({
        message: "bookCoverImage is required",
      });
    }
    if (!pdfUpdate || !pdfUpdate[0]) {
      return res.status(400).json({
        message: "pdfUpdate is required",
      });
    }

    let uploadedAvatar = null;
    let pdfUploaded = null;
    let epubUploaded = null;
    let mobiUploaded = null;

    if (bookCoverImage && bookCoverImage[0]) {
      uploadedAvatar = await uploadCloudinary(
        bookCoverImage[0].buffer,
        "image"
      );
    }

    if (pdfUpdate && pdfUpdate[0]) {
      pdfUploaded = await uploadCloudinary(pdfUpdate[0].buffer, "raw");
    }

    if (epubUpload && epubUpload[0]) {
      epubUploaded = await uploadToCloudinary(
        epubUpload[0].buffer,
        "application/epub+zip"
      );
    }

    if (kindleMobiUpload && kindleMobiUpload[0]) {
      mobiUploaded = await uploadToCloudinary(
        kindleMobiUpload[0].buffer,
        "application/x-mobipocket-ebook" || "application/vnd.amazon.ebook"
      );
    }

    // Check if a book with the same title exists and series is false
    const existingBook = await Book.findOne({ bookTitle, series: false });
    console.log("existingBook: ", existingBook);

    if (series.toLowerCase() === "false" && existingBook) {
      return res.status(400).json({
        message:
          "Multiple books not allowed for single book series with the same title.",
      });
    }

    const newBook = new Book({
      bookTitle,
      oblicAuthor,
      authorName,
      primaryCategory,
      secondaryCategory,
      series: series.toLowerCase() === "true",
      shortDescription,
      longDescription,
      bookCoverImage: uploadedAvatar
        ? {
            url: uploadedAvatar.secure_url,
            publicId: uploadedAvatar.public_id,
          }
        : null,
      pdfUpdate: pdfUploaded
        ? {
            url: pdfUploaded.secure_url,
            publicId: pdfUploaded.public_id,
          }
        : null,
      epubUpload: epubUploaded
        ? {
            url: epubUploaded.secure_url,
            publicId: epubUploaded.public_id,
          }
        : null,
      kindleMobiUpload: mobiUploaded
        ? {
            url: mobiUploaded.secure_url,
            publicId: mobiUploaded.public_id,
          }
        : null,
      rating, // Include rating if provided,
      // status,
      // userId
    });

    await newBook.save();
    res.status(201).json({
      message: "Book created successfully",
      newBook,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// const getAllBooks = async (req, res) => {
//   try {
//     const books = await Book.find().populate(
//       "primaryCategory secondaryCategory",
//       "id name"
//     );
//     // console.log("books :", books);
//     res.status(200).json({ message: "Books get successfully", books });
//   } catch (err) {
//     // res.status(500).json({ message: err.message });
//     console.log("err :", err);
//   }
// };

const getGenres = async (req, res) => {
  try {
    const genres = await Genres.distinct("primaryCategory");
    console.log("genres :", genres);
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getAllBooks = async (req, res) => {
//   try {
//     // Saari books ko fetch karte hain aur unki categories ko populate karte hain
//     const books = await Book.find().populate(
//       "primaryCategory secondaryCategory",
//       "id name"
//     );

//     // Saari favourite books ko fetch karte hain jo isFavorite true hain
//     const favouriteBooks = await favouriteSchema.find({ isFavourite: true }).select(
//       "_id bookId"
//     );
//     console.log("favouriteBooks :", favouriteBooks);

//    // Favourite books ke IDs ko extract karte hain
//    const favouriteBookIds = favouriteBooks.map((fav) => ({
//     favoriteId: fav._id.toString(),
//     bookId: fav.bookId.toString(),
//   }));
//     console.log("favouriteBookIds :", favouriteBookIds);

//     // Saari books ko map karte hain aur un books ka isFavorite field set karte hain
//     const booksWithFavoriteStatus = books.map((book) => ({
//       ...book._doc,
//       isFavourite: favouriteBookIds.some((fav) => fav.bookId === book._id.toString()),
//     }));
//     console.log("booksWithFavoriteStatus :", favouriteBookIds);

//     res.status(200).json({
//       message: "Books fetched successfully",
//       books: booksWithFavoriteStatus,
//       favouriteBooks: favouriteBookIds, // Add favouriteBooks to the response

//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const series = async (req, res, next) => {
  try {
    // const seriesCategory = await Category.findOne()
    // console.log("seriesCategory  :", seriesCategory);

    // if (!seriesCategory) {
    //     return res.status(404).json({
    //         success: false,
    //         message: 'series category not found'
    //     });
    // }

    // Validate that series field is boolean
    if (
      typeof req.query.series !== "undefined" &&
      req.query.series !== "true" &&
      req.query.series !== "false"
    ) {
      return res.status(400).json({
        message:
          "Invalid series query parameter. It should be 'true' or 'false'.",
      });
    }
    // Fetch books where series is true
    const seriesBooks = await Book.find({ series: true }).populate(
      "primaryCategory secondaryCategory",
      "id name"
    );
    // console.log("seriesBooks  :", seriesBooks);
    if (!seriesBooks.length) {
      return res.status(404).json({ message: "No series books found." });
    }

    res.json({ message: "Get all series books", series: seriesBooks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBooks = async (req, res) => {
  try {
    // Saari books ko fetch karte hain aur unki categories ko populate karte hain
    const books = await Book.find().populate(
      "primaryCategory secondaryCategory",
      "id name"
    );

    // Saari favourite books ko fetch karte hain jo isFavourite true hain
    const favouriteBooks = await favouriteSchema
      .find({ isFavourite: true })
      .select("_id bookId");
    // console.log("favouriteBooks :", favouriteBooks);

    // Favourite books ke IDs ko extract karte hain
    const favouriteBookIds = favouriteBooks.map((fav) => ({
      favoriteId: fav._id.toString(),
      bookId: fav.bookId.toString(),
    }));
    // console.log("favouriteBookIds :", favouriteBookIds);

    // Saari books ko map karte hain aur un books ka isFavorite field set karte hain
    const booksWithFavoriteStatus = books.map((book) => {
      const favouriteBook = favouriteBookIds.find(
        (fav) => fav.bookId === book._id.toString()
      );
      return {
        ...book._doc,
        isFavourite: !!favouriteBook,
        favoriteId: favouriteBook ? favouriteBook.favoriteId : null,
      };
    });
    // console.log("booksWithFavoriteStatus :", booksWithFavoriteStatus);

    res.status(200).json({
      message: "Books fetched successfully",
      books: booksWithFavoriteStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const audioBooks = async (req, res, next) => {
  try {
    const audioBooks = await Book.find(); //{ type: 'audio' } use karna hain
    console.log("audioBooks :", audioBooks);
    res.json(audioBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const newlyEdit = async (req, res, next) => {
  try {
    // Pehle sabse nayi (latest) book ko fetch kar rahe hain database se.
    const latestBook = await Book.findOne()
      .populate("primaryCategory secondaryCategory", "id name")
      .sort({ _id: -1 });
    // console.log("latestBook:", latestBook);

    // Phir 39 books ko fetch karte hain (39 isliye taake latest book ko add karke total 40 ho jaye)
    //Latest book ke baad wali 39 books ko fetch kar rahe hain taake total 40 books ban sakein jab latest book ko add karenge.
    //skip(1) ka matlab hai ke pehli (latest) book ko skip karna.
    let fetchBooks = await Book.find()
      .populate("primaryCategory secondaryCategory", "id name")
      .sort({ _id: -1 })
      .skip(1)
      .limit(39);
    // console.log("fetchBooks:", fetchBooks);

    //Agar latest book mili, toh usko fetchBooks list ke start mai add kar dete hain unshift method se
    if (latestBook) {
      fetchBooks.unshift(latestBook); // List ke start mai add karte hain
    }

    //Agar list ka size 40 se zyada ho gaya, toh slice(0, 40) method use kar ke
    //  last book ko remove kar dete hain aur list ko 40 items tak limit kar dete hain.
    if (fetchBooks.length > 40) {
      fetchBooks = fetchBooks.slice(0, 40); // Last book ko remove kar dete hain
    }

    res.status(200).json({ message: "Get all newly edit books", fetchBooks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    console.log("categoryId :", categoryId);

    // Validate if category exists
    const category = await Category.findById(categoryId);
    console.log("category :", category);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find all books with the given category ID and populate category details
    const getbooks = await Book.find({ primaryCategory: categoryId }).populate(
      "primaryCategory secondaryCategory",
      "_id name"
    );
    console.log("getbooks :", getbooks);

    if (!getbooks.length) {
      return res
        .status(404)
        .json({ message: "No books found for this category" });
    }

    res.status(200).json(getbooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const updateBook = async (req, res) => {
//   const { bookId } = req.params; // Assuming bookId is passed as a parameter

//   try {
//     // Check if the book exists
//     const existingBook = await Book.findById(bookId);
//     if (!existingBook) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     // Handle file uploads, if any
//     let updates = {};
//     if (req.files["bookCoverImage"]) {
//       updates.bookCoverImage = req.files["bookCoverImage"][0].path;
//     }
//     if (req.files["pdfUpdate"]) {
//       updates.pdfUpdate = req.files["pdfUpdate"][0].path;
//     }

//     // Update other fields if needed
//     if (req.body.bookTitle) {
//       updates.bookTitle = req.body.bookTitle;
//     }
//     if (req.body.oblicAuthor) {
//       updates.oblicAuthor = req.body.oblicAuthor;
//     }
//     if (req.body.authorName) {
//       updates.authorName = req.body.authorName;
//     }
//     if (req.body.primaryCategory) {
//       updates.primaryCategory = req.body.primaryCategory;
//     }
//     if (req.body.secondaryCategory) {
//       updates.secondaryCategory = req.body.secondaryCategory;
//     }
//     if (req.body.series) {
//       updates.series = req.body.series;
//     }
//     if (req.body.shortDescription) {
//       updates.shortDescription = req.body.shortDescription;
//     }
//     if (req.body.longDescription) {
//       updates.longDescription = req.body.longDescription;
//     }
//     if (req.body.epubUpload) {
//       updates.epubUpload = req.body.epubUpload;
//     }
//     if (req.body.kindleMobiUpload) {
//       updates.kindleMobiUpload = req.body.kindleMobiUpload;
//     }

//     // Update the book
//     const updatedBook = await Book.findByIdAndUpdate(bookId, updates, {
//       new: true,
//     });

//     res.status(200).json(updatedBook);
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: err.message });
//   }
// };

// const deleteBook = async (req, res) => {
//   try {
//     await Book.findByIdAndDelete(req.params.id);
//     res.json({ message: "Book deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// const deleteBook = async (req, res) => {
//   try {
//     const bookId = req.params.id;
//     console.log("bookId: ", bookId);
//     const book = await Book.findById(bookId);
//     console.log("book: ", book);

//     if (!book) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     // Book ko RecentlyReadBook se bhi remove karte hain
//     await RecentlyReadBook.deleteMany({ bookId });
//     res.status(200).json({ message: "Book deleted successfully", book });
//   } catch (err) {
//     console.error("Error deleting book:", err);
//     res.status(500).json({ message: "Error deleting book", error: err.message });
//   }
// };

const deleteBook = async (req, res) => {
  try {
    // Book ko delete karen
    await Book.findByIdAndDelete(req.params.id);

    // RecentlyReadBook collection se bhi book ko delete karen
    await RecentlyReadBook.deleteMany({ bookId: req.params.id });

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const updateBook = async (req, res) => {

//   var bookId = req.params.id;
//   console.log("bookId: ", bookId);
//   const {
//     bookTitle,
//     oblicAuthor,
//     authorName,
//     primaryCategory,
//     secondaryCategory,
//     series,
//     shortDescription,
//     longDescription,
//     rating,
//   } = req.body;
//   console.log("Book: ", req.body);

//   if (!mongoose.isValidObjectId(bookId)) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid book id" });
//   }

//   //Hum check kar rahe hain ke audioBookId valid hai ya nahi.
//   //Agar valid nahi hai toh response mein error message bhej rahe hain:

//   const updateBook = await Book.findById(bookId);
//   console.log("updateBook: ", updateBook);

//   if (!updateBook) {
//     return res.status(404).json({ success: false, message: "Book not found" });
//   }

//   try {
//     let updatedData = {};
//     if (bookTitle) {
//       updatedData.bookTitle = bookTitle;
//     }

//     if (oblicAuthor) {
//       updatedData.oblicAuthor = oblicAuthor;
//     }

//     if (authorName) {
//       updatedData.authorName = authorName;
//     }
//     if (primaryCategory) {
//       updatedData.primaryCategory = primaryCategory;
//     }
//     if (secondaryCategory) {
//       updatedData.secondaryCategory = secondaryCategory;
//     }
//     if (series) {
//       updatedData.series = series;
//     }

//     if (shortDescription) {
//       updatedData.shortDescription = shortDescription;
//     }

//     if (longDescription) {
//       updatedData.longDescription = longDescription;
//     }
//     if (rating) {
//       updatedData.rating = rating;
//     }

//     if (req.files) {
//       const { bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload } =
//         req.files;
//       console.log(
//         " bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload: ",
//         req.files
//       );

//       // let uploadedAvatar = null;
//       // let uploadedAudio = null;

//       let uploadedbookCoverImage = null;
//       let uploadedpdfUpdate = null;
//       let uploadedepubUpload = null;
//       let uploadedkindleMobiUpload = null;

//       if (bookCoverImage && bookCoverImage[0]) {
//         if (updateBook.bookCoverImage && updateBook.bookCoverImage.publicId) {
//           await deleteImgCloudinary(updateBook.bookCoverImage.publicId);
//         }
//         uploadedbookCoverImage = await uploadCloudinary(
//           bookCoverImage[0].buffer,
//           "image/jpeg" || "image/png" || "image"
//         );
//         updatedData.bookCoverImage = {
//           url: uploadedbookCoverImage.secure_url,
//           publicId: uploadedbookCoverImage.public_id,
//         };
//       }

//       if (pdfUpdate && pdfUpdate[0]) {
//         if (updateBook.pdfUpdate && updateBook.pdfUpdate.publicId) {
//           await deleteImgCloudinary(updateBook.pdfUpdate.publicId);
//         }
//         uploadedpdfUpdate = await uploadCloudinary(
//           pdfUpdate[0].buffer,
//           "raw" || "application/pdf"
//         );
//         updatedData.pdfUpdate = {
//           url: uploadedpdfUpdate.secure_url,
//           publicId: uploadedpdfUpdate.public_id,
//         };
//       }

//       if (epubUpload && epubUpload[0]) {
//         if (updateBook.epubUpload && updateBook.epubUpload.publicId) {
//           await deleteImgCloudinary(updateBook.epubUpload.publicId);
//         }
//         uploadedepubUpload = await uploadCloudinary(
//           epubUpload[0].buffer,
//           "application/epub+zip"
//         );
//         updatedData.epubUpload = {
//           url: uploadedepubUpload.secure_url,
//           publicId: uploadedepubUpload.public_id,
//         };
//       }

//       if (kindleMobiUpload && kindleMobiUpload[0]) {
//         if (updateBook.kindleMobiUpload && updateBook.kindleMobiUpload.publicId) {
//           await deleteImgCloudinary(updateBook.kindleMobiUpload.publicId);
//         }
//         uploadedkindleMobiUpload = await uploadCloudinary(
//           kindleMobiUpload[0].buffer,
//           "application/vnd.amazon.ebook" || "application/x-mobipocket-ebook"
//         );
//         updatedData.kindleMobiUpload = {
//           url: uploadedkindleMobiUpload.secure_url,
//           publicId: uploadedkindleMobiUpload.public_id,
//         };
//       }

//       console.log("uploadedbookCoverImage: ", uploadedbookCoverImage);
//       console.log("uploadedpdfUpdate: ", uploadedpdfUpdate);
//       console.log("uploadedepubUpload: ", uploadedepubUpload);
//       console.log("uploadedkindleMobiUpload: ", uploadedkindleMobiUpload);
//     }

//     const updateData = await Book.updateOne(
//       { _id: bookId },
//       { $set: updatedData }
//     );

//     console.log("updateData: ", updateData);

//     res.status(200).json({
//       success: true,
//       message: "Book updated successfully",
//       updateBook,
//       // updateData,
//     });
//   } catch (error) {
//     console.log("updateUserError: ", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error in updating Audio Book" });
//   }
// };

// const getAllRomanceBooks = async (req, res, next) => {
//   try {
//     const romanceCategory = await Category.findOne({ name: "Romance" }).exec();
//     console.log("romanceCategory :", romanceCategory);

//     if (!romanceCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "Romance category not found",
//       });
//     }

//     // Fetch books with 'sports' as the primary category
//     const romanceBooks = await Book.find({
//       primaryCategory: romanceCategory?._id,
//     })
//       .populate("primaryCategory") // Populate category details
//       .populate("secondaryCategory") // Populate secondary category details (if any)
//       .exec();

//     console.log("romanceBooks:", romanceBooks);

//     // Check if no books found
//     if (romanceBooks.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "RomanceBooks not found",
//       });
//     }

//     // Favourite books ko find karna
//     const favouriteBooks = await favouriteSchema.find({ isFavourite: true }).select("_id bookId").exec();
//     console.log("favouriteBooks :", favouriteBooks);

//     // Favourite books ke IDs ko extract karte hain
//     const favouriteBookIds = favouriteBooks.map((fav) => ({
//       favoriteId: fav._id.toString(),
//       bookId: fav.bookId.toString(),
//     }));
//     console.log("favouriteBookIds :", favouriteBookIds);

//     // Saari books ko map karte hain aur un books ka isFavorite field set karte hain
//     const booksWithFavoriteStatus = favouriteBooks.map((book) => {
//       const favouriteBook = favouriteBookIds.find((fav) => fav.bookId === book._id.toString());
//       return {
//         ...book._doc,
//         isFavourite: !!favouriteBook,
//         favoriteId: favouriteBook ? favouriteBook.favoriteId : null,
//       };
//     });
//     console.log("booksWithFavoriteStatus :", booksWithFavoriteStatus);

//     res.status(200).json({
//       success: true,
//       message: "Fetched all romance books successfully",
//       data: romanceBooks,
//     });

//     // res.status(200).json({
//     //   success: true,
//     //   data: romanceBooks,
//     // });
//   } catch (error) {
//     console.log("error :", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

const getAllYoungAdultBooks = async (req, res, next) => {
  try {
    const youngAdultCategory = await Category.findOne({
      name: "Young Adult",
    }).exec();
    console.log("youngAdultCategory :", youngAdultCategory);

    if (!youngAdultCategory) {
      return res.status(404).json({
        success: false,
        message: "Young adult category not found",
      });
    }

    // Fetch books with 'sports' as the primary category
    const youngBooks = await Book.find({
      primaryCategory: youngAdultCategory?._id,
    })
      .populate("primaryCategory") // Populate category details
      .populate("secondaryCategory") // Populate secondary category details (if any)
      .exec();

    console.log("youngBooks:", youngBooks);

    // Check if no books found
    if (youngBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Young adult books not found",
      });
    }

    res.status(200).json({
      success: true,
      data: youngBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// const getAllRomanceBooks = async (req, res, next) => {
//   try {
//     //Code pehle database me Category collection se Romance category ko find karta hai.
//     //Agar Romance category nahi milti, toh 404 error return karta hai.
//     const romanceCategory = await Category.findOne({ name: "Romance" }).exec();
//     // console.log("romanceCategory :", romanceCategory);

//     if (!romanceCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "Romance category not found",
//       });
//     }

//     //Agar Romance category mil jati hai, toh code Book collection se woh books find karta hai jo Romance category se related hain.
//     //primaryCategory aur secondaryCategory fields ko populate karta hai taake category details bhi saath me mil jayein.
//     //Agar koi romance books nahi milti, toh 404 error return karta hai.
//     const romanceBooks = await Book.find({
//       primaryCategory: romanceCategory._id,
//     })
//       .populate("primaryCategory", "id name") // Category details populate karna
//       .populate("secondaryCategory", "id name") // Secondary category details populate karna
//       .exec();

//     // console.log("romanceBooks:", romanceBooks);

//     if (romanceBooks.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "RomanceBooks not found",
//       });
//     }

//     // User ke token ko check karna
//     const token = req.header("Authorization");
//     console.log("romance books api token", token);
//     let userPlan = null;
//     if (token) {
//       const user = await User.findOne({ downloadToken: token }).populate(
//         "paymentPlanId"
//       );
//       console.log("find romance books api user", user);

//       if (user) {
//         userPlan = user.paymentPlanId;
//       }
//     }

//     // Code favouriteSchema collection se favourite books find karta hai aur unki IDs extract karta hai.
//     const favouriteBooks = await favouriteSchema
//       .find({ isFavourite: true })
//       .select("_id bookId")
//       .exec();
//     console.log("favouriteBooks :", favouriteBooks);

//     // Favourite books ki IDs ko extract karna
//     const favouriteBookIds = favouriteBooks.map((fav) => ({
//       favoriteId: fav._id.toString(),
//       bookId: fav.bookId.toString(),
//     }));
//     // console.log("favouriteBookIds :", favouriteBookIds);

//     // Romance books ko map karke unka isFavourite aur favoriteId field set karna
//     const romanceBooksWithFavoriteStatus = romanceBooks.map((book) => {
//       const favouriteBook = favouriteBookIds.find(
//         (fav) => fav.bookId === book._id.toString()
//       );

//       //   return {
//       //     ...book._doc,
//       //     isFavourite: !!favouriteBook,
//       //     favoriteId: favouriteBook ? favouriteBook.favoriteId : null,
//       //   };
//       // });

//       const bookData = {
//         ...book._doc,
//         isFavourite: !!favouriteBook,
//         favoriteId: favouriteBook ? favouriteBook.favoriteId : null,
//       };

//       console.log("bookData :", bookData);

//       // Check user plan and download counts to conditionally show URLs
//       // User plan aur download counts ko check karke URLs conditionally show karna
//       if (
//         !userPlan ||
//         userPlan.bookDownload <= 0 ||
//         userPlan.audioBookDownload <= 0
//       ) {
//         bookData.epub = undefined;
//         bookData.mobi = undefined;
//         bookData.pdf = undefined;
//       }

//       return bookData;
//     });

//     res.status(200).json({
//       success: true,
//       data: romanceBooksWithFavoriteStatus,
//     });
//   } catch (error) {
//     console.log("error :", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

const getAllDarkBooks = async (req, res, next) => {
  try {
    const darkCategory = await Category.findOne({ name: "Dark 17+" }).exec();
    console.log("darkCategory :", darkCategory);

    if (!darkCategory) {
      return res.status(404).json({
        success: false,
        message: "Dark 17 category not found",
      });
    }

    // Fetch books with 'sports' as the primary category
    const darkBooks = await Book.find({
      primaryCategory: darkCategory?._id,
    })
      .populate("primaryCategory") // Populate category details
      .populate("secondaryCategory") // Populate secondary category details (if any)
      .exec();

    console.log("darkBooks:", darkBooks);

    // Check if no books found
    if (darkBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dark books not found",
      });
    }

    res.status(200).json({
      success: true,
      data: darkBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateBook = async (req, res) => {
  const bookId = req.params.id;
  // console.log("bookId: ", bookId);

  const {
    bookTitle,
    oblicAuthor,
    authorName,
    primaryCategory,
    secondaryCategory,
    series,
    shortDescription,
    longDescription,
    rating,
  } = req.body;

  // console.log("Book: ", req.body);

  if (!mongoose.isValidObjectId(bookId)) {
    return res.status(400).json({ success: false, message: "Invalid book id" });
  }

  const bookToUpdate = await Book.findById(bookId);
  if (!bookToUpdate) {
    return res.status(404).json({ success: false, message: "Book not found" });
  }

  try {
    const updatedData = {
      ...(bookTitle && { bookTitle }),
      ...(oblicAuthor && { oblicAuthor }),
      ...(authorName && { authorName }),
      ...(primaryCategory && { primaryCategory }),
      ...(secondaryCategory && { secondaryCategory }),
      ...(series && { series }),
      ...(shortDescription && { shortDescription }),
      ...(longDescription && { longDescription }),
      ...(rating && { rating }),
    };

    if (req.files) {
      const uploadMapping = {
        bookCoverImage: "image/jpeg",
        pdfUpdate: "application/pdf",
        epubUpload: "application/epub+zip",
        kindleMobiUpload: "application/vnd.amazon.ebook",
      };

      for (const [key, mimeType] of Object.entries(uploadMapping)) {
        if (req.files[key] && req.files[key][0]) {
          if (bookToUpdate[key] && bookToUpdate[key].publicId) {
            await deleteImgCloudinary(bookToUpdate[key].publicId);
          }
          const uploadResult = await uploadCloudinary(
            req.files[key][0].buffer,
            mimeType
          );
          updatedData[key] = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          };
        }
      }
    }

    await Book.updateOne({ _id: bookId }, { $set: updatedData });

    // Fetch the updated book details to include in the response
    const updatedBook = await Book.findById(bookId);

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      updatedBook,
    });
  } catch (error) {
    console.log("updateBookError: ", error);
    res.status(500).json({ success: false, message: "Error in updating book" });
  }
};

const getAllRomanceBooks = async (req, res, next) => {
  try {
    // Romance category ko find karna
    const romanceCategory = await Category.findOne({ name: "Romance" }).exec();

    if (!romanceCategory) {
      return res.status(404).json({
        success: false,
        message: "Romance category not found",
      });
    }

    // Romance books ko find karna
    const romanceBooks = await Book.find({
      primaryCategory: romanceCategory._id,
    })
      .populate("primaryCategory", "id name")
      .populate("secondaryCategory", "id name")
      .exec();

    if (romanceBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Romance books not found",
      });
    }

    // User ke token ko check karna
    const token = req.header("Authorization");
    let userPlan = null;
    if (token) {
      const user = await User.findOne({ downloadToken: token }).populate(
        "paymentPlanId"
      );
      if (user) {
        userPlan = user.paymentPlanId;
      }
    }

    // Favourite books ko find karna
    const favouriteBooks = await favouriteSchema
      .find({ isFavourite: true })
      .select("_id bookId")
      .exec();
    const favouriteBookIds = favouriteBooks.map((fav) => ({
      favoriteId: fav._id.toString(),
      bookId: fav.bookId.toString(),
    }));

    // Romance books ko map karke unka isFavourite aur favoriteId field set karna
    const romanceBooksWithFavoriteStatus = romanceBooks.map((book) => {
      const favouriteBook = favouriteBookIds.find(
        (fav) => fav.bookId === book._id.toString()
      );

      const bookData = {
        ...book._doc,
        isFavourite: !!favouriteBook,
        favoriteId: favouriteBook ? favouriteBook.favoriteId : null,
      };

      // User plan aur download counts ko check karke URLs conditionally show karna
      // Yeh condition add ki gayi hai:
      if (
        !token ||
        !userPlan ||
        userPlan.bookDownload <= 0 ||
        userPlan.audioBookDownload <= 0
      ) {
        bookData.epub = undefined;
        bookData.mobi = undefined;
        bookData.pdf = undefined;
      }

      return bookData;
    });

    res.status(200).json({
      success: true,
      data: romanceBooksWithFavoriteStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllBillionaireBooks = async (req, res, next) => {
  try {
    const billionaireCategory = await Category.findOne({
      name: "Billionaire",
    }).exec();
    console.log("billionaireCategory :", billionaireCategory);

    if (!billionaireCategory) {
      return res.status(404).json({
        success: false,
        message: "Billionaire category not found",
      });
    }

    // Fetch books with 'sports' as the primary category
    const billionaireBooks = await Book.find({
      primaryCategory: billionaireCategory?._id,
    })
      .populate("primaryCategory") // Populate category details
      .populate("secondaryCategory") // Populate secondary category details (if any)
      .exec();

    console.log("billionaireBooks:", billionaireBooks);

    // Check if no books found
    if (billionaireBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Billionaire books not found",
      });
    }

    res.status(200).json({
      success: true,
      data: billionaireBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllSciFiBooks = async (req, res, next) => {
  try {
    const sciFiCategory = await Category.findOne({ name: "Sci-Fi" }).exec();
    console.log("sciFiCategory :", sciFiCategory);

    if (!sciFiCategory) {
      return res.status(404).json({
        success: false,
        message: "Billionaire category not found",
      });
    }

    // Fetch books with 'sports' as the primary category
    const sciFiBooks = await Book.find({
      primaryCategory: sciFiCategory?._id,
    })
      .populate("primaryCategory") // Populate category details
      .populate("secondaryCategory") // Populate secondary category details (if any)
      .exec();

    console.log("sciFiBooks:", sciFiBooks);

    // Check if no books found
    if (sciFiBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sci fi books not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sciFiBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllHistoricalRomanceBooks = async (req, res, next) => {
  try {
    const historicalRomanceCategory = await Category.findOne({
      name: "Historical Romance",
    }).exec();
    console.log("historicalRomanceCategory :", historicalRomanceCategory);

    if (!historicalRomanceCategory) {
      return res.status(404).json({
        success: false,
        message: "Billionaire category not found",
      });
    }

    // Fetch books with 'sports' as the primary category
    const historicalRomanceBooks = await Book.find({
      primaryCategory: historicalRomanceCategory?._id,
    })
      .populate("primaryCategory") // Populate category details
      .populate("secondaryCategory") // Populate secondary category details (if any)
      .exec();

    console.log("historicalRomanceBooks:", historicalRomanceBooks);

    // Check if no books found
    if (historicalRomanceBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hstorical Romance books not found",
      });
    }

    res.status(200).json({
      success: true,
      data: historicalRomanceBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllLGBTQBooks = async (req, res, next) => {
  try {
    const lGBTQCategory = await Category.findOne({ name: "LGBTQ+" }).exec();
    console.log("lGBTQCategory :", lGBTQCategory);

    if (!lGBTQCategory) {
      return res.status(404).json({
        success: false,
        message: "LGBTQ category not found",
      });
    }

    // Fetch books with 'sports' as the primary category
    const lGBTQBooks = await Book.find({
      primaryCategory: lGBTQCategory?._id,
    })
      .populate("primaryCategory") // Populate category details
      .populate("secondaryCategory") // Populate secondary category details (if any)
      .exec();

    console.log("lGBTQBooks:", lGBTQBooks);

    // Check if no books found
    if (lGBTQBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "LGBTQ books not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lGBTQBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllSpotBooks = async (req, res, next) => {
  try {
    const sportsCategory = await Category.findOne({ name: "Sports" }).exec();
    // console.log("sportsCategory :", sportsCategory);

    if (!sportsCategory) {
      return res.status(404).json({
        success: false,
        message: "Sports category not found",
      });
    }

    // Fetch books with 'sports' as the primary category
    const sportsBooks = await Book.find({ primaryCategory: sportsCategory._id })
      .populate("primaryCategory") // Populate category details
      .populate("secondaryCategory") // Populate secondary category details (if any)
      .exec();

    // console.log('Sports Books:', sportsBooks);

    // Check if no books found
    if (!sportsBooks.length) {
      return res.status(404).json({
        success: false,
        message: "Sports books not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sportsBooks,
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllFictionFantasyBooks = async (req, res, next) => {
  try {
    // Fetch category IDs for 'Fiction' and 'Fantasy'
    const categories = await Category.find({
      name: { $in: ["Fiction", "Fantasy"] },
    }).exec();
    const categoryIds = categories.map((category) => category._id.toString()); // Ensure IDs are in string format

    if (categoryIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Fiction or Fantasy categories not found",
      });
    }

    // Fetch books with 'Fiction' or 'Fantasy' as primary or secondary category
    const books = await Book.find({
      $or: [
        { primaryCategory: { $in: categoryIds } },
        { secondaryCategory: { $in: categoryIds } },
      ],
    })
      .populate("primaryCategory") // Populate primary category details
      .populate("secondaryCategory") // Populate secondary category details
      .exec();

    // Filter and format the books
    const formattedBooks = books
      .map((book) => {
        // Check if both categories are Fiction or Fantasy
        const primaryCategoryMatch =
          book.primaryCategory &&
          categoryIds.includes(book.primaryCategory._id.toString());
        const secondaryCategoryMatch =
          book.secondaryCategory &&
          categoryIds.includes(book.secondaryCategory._id.toString());

        const filteredPrimaryCategory = primaryCategoryMatch
          ? {
              id: book.primaryCategory._id,
              name: book.primaryCategory.name,
            }
          : null;

        const filteredSecondaryCategory = secondaryCategoryMatch
          ? {
              id: book.secondaryCategory._id,
              name: book.secondaryCategory.name,
            }
          : null;

        // Include the book only if both primary and secondary categories are Fiction or Fantasy
        if (primaryCategoryMatch && secondaryCategoryMatch) {
          return {
            ...book._doc,
            primaryCategory: filteredPrimaryCategory,
            secondaryCategory: filteredSecondaryCategory,
          };
        } else {
          return null; // Exclude books that don't match the criteria
        }
      })
      .filter((book) => book !== null); // Remove null entries

    if (formattedBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Books not found for the specified categories",
      });
    }

    res.status(200).json({
      success: true,
      data: formattedBooks,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllThrillerSuspenseBooks = async (req, res, next) => {
  try {
    // Fetch category IDs for 'Thriller' and 'Suspense'
    const categories = await Category.find({
      name: { $in: ["Thriller", "Suspense"] },
    }).exec();
    const categoryIds = categories.map((category) => category._id.toString()); // Ensure IDs are in string format

    if (categoryIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Thriller or Suspense categories not found",
      });
    }

    // Fetch books with primary or secondary category as 'Thriller' or 'Suspense'
    const books = await Book.find({
      $or: [
        { primaryCategory: { $in: categoryIds } },
        { secondaryCategory: { $in: categoryIds } },
      ],
    })
      .populate("primaryCategory")
      .populate("secondaryCategory")
      .exec();

    // Filter and format the books
    const formattedBooks = books
      .map((book) => {
        // Check if both primary and secondary categories are Thriller or Suspense
        const primaryCategoryMatch =
          book.primaryCategory &&
          categoryIds.includes(book.primaryCategory._id.toString());
        const secondaryCategoryMatch =
          book.secondaryCategory &&
          categoryIds.includes(book.secondaryCategory._id.toString());

        const filteredPrimaryCategory = primaryCategoryMatch
          ? {
              id: book.primaryCategory._id,
              name: book.primaryCategory.name,
            }
          : null;

        const filteredSecondaryCategory = secondaryCategoryMatch
          ? {
              id: book.secondaryCategory._id,
              name: book.secondaryCategory.name,
            }
          : null;

        // Include the book only if both primary and secondary categories are Thriller or Suspense
        if (primaryCategoryMatch && secondaryCategoryMatch) {
          return {
            ...book._doc,
            primaryCategory: filteredPrimaryCategory,
            secondaryCategory: filteredSecondaryCategory,
          };
        } else {
          return null; // Exclude books that don't match the criteria
        }
      })
      .filter((book) => book !== null); // Remove null entries

    if (formattedBooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Books not found for the specified categories",
      });
    }

    res.status(200).json({
      success: true,
      data: formattedBooks,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const incrementClickCount = async (req, res) => {
  try {
    // Extract categoryId from request parameters (you need to pass this ID when calling the API)
    const categoryId = req?.params?.id;
    // console.log("categoryId: ", categoryId);

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    //Yeh line specific category ka clickCount barha rahi hai. findByIdAndUpdate se tum category ko find karte
    // ho aur $inc operator se count ko 1 se barhate ho
    await Category.findByIdAndUpdate(
      categoryId,
      { $inc: { clickCount: 1 } },
      { new: true } // Return the updated document
    );

    //Yeh line sab categories ko fetch karti hai aur unhe clickCount ke hisaab se descending order
    //  (sabse zyada click wali category pehle) mein sort karti hai
    const categories = await Category.find({}).sort({ clickCount: -1 }).exec(); // Execute the query

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

const getAllTopsBooks = async (req, res) => {
  try {
    // Yeh line sab categories ko fetch karti hai aur unhe clickCount ke hisaab se descending order
    // (sabse zyada click wali category pehle) mein sort karti hai aur limit karti hai 5 documents tak
    const categories = await Category.find({})
      .sort({ clickCount: -1 })
      .limit(5)
      .exec(); // Execute the query

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

const relatedBookApi = async (req, res) => {
  try {
    const { primaryCategory } = req.query; // Request query se primaryCategory ko retrieve karein

    // Check agar primaryCategory di gayi hai
    if (!primaryCategory) {
      return res.status(400).json({ message: "Primary category is required" });
    }

    // Primary category ke basis pe books ko fetch karein
    const books = await Book.find({ primaryCategory }).populate(
      "primaryCategory secondaryCategory",
      "id name"
    );

    // Response mein books return karein
    res.status(200).json({
      message: "Books fetched successfully",
      books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books", error });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getGenres,
  series,
  audioBooks,
  newlyEdit,
  getBookById,
  updateBook,
  deleteBook,
  getAllSpotBooks,
  getAllRomanceBooks,
  getAllDarkBooks,
  getAllYoungAdultBooks,
  getAllBillionaireBooks,
  getAllSciFiBooks,
  getAllHistoricalRomanceBooks,
  getAllLGBTQBooks,
  getAllFictionFantasyBooks,
  getAllThrillerSuspenseBooks,
  getAllTopsBooks,
  incrementClickCount,
  relatedBookApi,
};
