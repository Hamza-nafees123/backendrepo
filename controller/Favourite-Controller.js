const favouriteSchema = require("../models/Favourite-Model.js")
const Book = require("../models/BookModel.js")
// const { uploadCloudinary, deleteImgCloudinary, uploadToCloudinary } = require("../cloudinary.js");

const addFavouriteBook = async (req, res) => {
    try {
        const { userId, bookId, bookTitle, oblicAuthor, authorName, primaryCategory, secondaryCategory, series, shortDescription, longDescription, bookCoverImage, pdfUpdate, epubUpload, kindleMobiUpload, status, rating, isFavourite } = req.body;

        // Check if isFavourite is true
        if (!isFavourite) {
            return res.status(400).json({ message: 'isFavorite must be true to add to favourites' });
        }

        const existBookId = await favouriteSchema.findOne({ bookId })
        if (existBookId) {
            return res.status(201).json({
                message: "Book read already exist"
            });
        }


        // Create new favourite document
        const favourite = new favouriteSchema({
            userId,
            bookId,
            bookTitle,
            oblicAuthor,
            authorName,
            primaryCategory,
            secondaryCategory,
            series,
            shortDescription,
            longDescription,
            bookCoverImage,
            pdfUpdate,
            epubUpload,
            kindleMobiUpload,
            status,
            rating,
            isFavourite
        });
        // console.log("favourite :", favourite);


        await favourite.save();
        const updateBookIsFavorite = await Book.findByIdAndUpdate(bookId, { isFavourite: true });
        console.log("updateBookIsFavorite :", updateBookIsFavorite);

        res.status(201).json({ message: 'Favorite Book created successfully', favourite });
    } catch (error) {
        console.log("error :", error);
        res.status(500).json({ message: error.message });

    }
};

const getAllFavouriteBook = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming req.user contains authenticated user's details
        // console.log("userId :", userId);
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // if (!bookId) {
        //     return res.status(400).json({ message: 'Book ID is required' });
        // }

        const books = await favouriteSchema.find({ userId }).populate(
            "primaryCategory secondaryCategory",
            "id name"
        ).exec(); // Execute query;
        // console.log("books :", books);


        // books array ko filter karte hain aur sirf woh books select karte hain jinka isFavourite field true hai.
        const favouriteBooks = books.filter(book => book.isFavourite);
        // console.log("favouriteBooks :", favouriteBooks);

        if (favouriteBooks.length > 0) {
            return res.status(200).json({ message: "Favourite books retrieved successfully", books: favouriteBooks });
        } else {
            return res.status(404).json({ message: "No favourite books for this user" });
        }

        // // Agar books milti hain
        // if (books.length > 0) {
        //     return res.status(200).json({ message: "Favourite books retrieved successfully", books });
        // } else {
        //     // Agar kisi book nahi milti
        //     return res.status(404).json({ message: "No books favourite for this user" });
        // }
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).json({ message: err.message });

    }
};

// const deleteFavouriteBook = async (req, res) => {
//     try {
//         const id = req.params.id;
//         console.log("id: ", id);

//         const deleteFavouriteBook = await favouriteSchema.findByIdAndDelete(
//             id
//         );
//         // console.log("deleteFavouriteBook: ", deleteFavouriteBook);

//         if (!deleteFavouriteBook) {
//             return res.status(404).json({
//                 message: `Cannot delete coupon code with id=${id}. Maybe coupon code was not found!`,
//             });
//         }

//         res
//             .status(200)
//             .json({ message: "Favourite Book deleted successfully", deleteFavouriteBook });
//     } catch (error) {
//         console.log("error :", error);
//         res.status(500).json({
//             message: `Could not delete favourite Book with id=${id}`,
//             error: err.message,
//         });
//     }
// };

// const deleteFavouriteBook = async (req, res) => {
//     try {
//         const id = req.params.id;
//         // console.log("id: ", id);

//         // Book ko delete karne ke bajaye, hum uska status update karenge
//         const updateFavouriteBook = await favouriteSchema.findByIdAndUpdate(
//             id,
//             { isFavourite: false },
//             { new: true }
//         );
//         // console.log("updateFavouriteBook: ", updateFavouriteBook);

//         if (!updateFavouriteBook) {
//             return res.status(404).json({
//                 message: `Cannot update favourite book with id=${id}. Maybe favourite book was not found!`,
//             });
//         }

//         res.status(200).json({ message: "Favourite Book status updated to false successfully", updateFavouriteBook });
//     } catch (error) {
//         console.log("error :", error);
//         res.status(500).json({
//             message: `Could not update favourite book with id=${id}`,
//             error: error.message,
//         });
//     }
// };


// const deleteFavouriteBook = async (req, res) => {
//     try {
//         const id = req.params.id;
//         console.log("id :", id);

//         // Favourite book ko update karte hain taake isFavorite false ho jaye
//         const favourite = await favouriteSchema.findByIdAndUpdate(
//             id,
//             { isFavourite: false },
//             { new: true }
//         );
//         // console.log("favourite :", favourite);

//         // Agar favourite book nahi milti to error response return karte hain
//         if (!favourite) {
//             return res.status(404).json({ message: "Favourite not found" });
//         }

//         // Original book ko bhi update karte hain taake uska isFavorite field false ho jaye
//         const updateBook = await Book.findByIdAndUpdate(favourite.bookId, {
//             isFavourite: false,
//         });
//         // console.log("updateBook :", updateBook);

//         res.status(200).json({ message: "Book removed from favourites", favourite });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


const deleteFavouriteBook = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id :", id);

        // Favourite book ko find karte hain
        const favourite = await favouriteSchema.findById(id);
        if (!favourite) {
            return res.status(404).json({ message: "Favourite not found" });
        }

        // Favourite collection se book ko delete karte hain
        await favouriteSchema.findByIdAndDelete(id);

        // Original book ko update karte hain taake isFavourite field false ho jaye
        const updateBook = await Book.findByIdAndUpdate(favourite.bookId, {
            isFavourite: false,
        });

        // Agar original book nahi milti to error response return karte hain
        if (!updateBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json({ message: "Book removed from favourites", favourite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    addFavouriteBook,
    getAllFavouriteBook,
    deleteFavouriteBook
}