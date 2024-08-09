const mongoose = require("mongoose");
const Book = require("../models/BookModel.js");
const Category = require("../models/CategoryModel");
const homePageSelectedBookSchema = require("../models/Home-Page-Selected-Model.js");

exports.homePageSelectedRomance = async (req, res, next) => {
    try {
        // Extract required fields from request body
        const { bookId, categoryId } = req.body;
        console.log("bookId :", bookId);

        // Check if bookId is provided
        if (!bookId || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'book and category id is required.'
            });
        }


        // Fetch primary category details
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }
        console.log("book :", book);

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            });
        }
        console.log("category :", category);




        // // Check for required fields
        // if (!bookTitle || !authorName || !primaryCategory || !shortDescription || !longDescription || !imageUpload.url || !audioUpload.url) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "All fields are required"
        //     });
        // }


        // Create a new Banner instance
        const createBanner = await homePageSelectedBookSchema.create({
            bookId: bookCategory._id, // Assign bookId as the _id of BookCategory
            categoryId: category._id, // Assign bookId as the _id of BookCategory
            addedAt: new Date() // Timestamp for sorting the books to display the latest one on top

        });
        console.log("createBanner: ", createBanner);
        // // Save the new banner to the database
        // const savedBanner = await createBanner.save();
        // console.log("savedBanner: ", savedBanner);

        res.status(201).json({
            success: true,
            message: "Hoem page selected book created successfully",
            createBanner
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create banner",
            error: error.message // Optional: Send detailed error message
        });
    }
}

exports.getHomePageBannerSelectedRomance = async (req, res, next) => {
    try {
        let bannerBooks = await homePageSelectedBookSchema.find()
            .populate({
                path: 'bookId',
                model: 'Book',
                select: 'bookTitle oblicAuthor authorName shortDescription longDescription series primaryCategory secondaryCategory pdfUpdate bookCoverImage kindleMobiUpload epubUpload',
                populate: {
                    path: 'primaryCategory secondaryCategory',
                    model: 'Category',
                    select: 'id name'
                }
            });

        // Filter out banners where bookId is null
        const bannersToDelete = bannerBooks.filter(banner => !banner.bookId);

        // If there are banners to delete, perform deletion
        if (bannersToDelete.length > 0) {
            await Banner.deleteMany({ _id: { $in: bannersToDelete.map(banner => banner._id) } });
            console.log(`Deleted ${bannersToDelete.length} banners where bookId was null.`);
        }

        // Filter out null bookIds from the remaining bannerBooks
        bannerBooks = bannerBooks.filter(banner => banner.bookId); // Reassigning bannerBooks

        if (bannerBooks.length === 0) {
            return res.status(404).json({ message: "No banner books found" });
        }

        res.status(200).json({
            message: "Get all banner books successfully",
            bannerBooks
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deletebannerBooks = async (req, res, next) => {
    try {
        const deletedBannerBook = req.params.id
        console.log("deletedBannerBook: ", deletedBannerBook);

        // Agar category mil gayi toh delete karo
        await homePageSelectedBookSchema.findByIdAndDelete(deletedBannerBook);

        res.status(200).json({ message: "Home page selected romance book deleted successfully" });


    } catch (error) {
        console.log("error :", error);
        // res.status(500).json({ message: err.message });

    }
}
