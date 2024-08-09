const mongoose = require('mongoose')
const BookCategory = require('../models/BookModel.js');
const Banner = require('../models/Banner-api.Model.js');


const createBannerApi = async (req, res, next) => {
    try {
        // Extract required fields from request body
        const { bookId, status } = req.body;
        console.log("bookId :", bookId);

        // Check if bookId is provided
        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: 'book id is required.'
            });
        }


        // Fetch primary category details
        const bookCategory = await BookCategory.findById(bookId);
        if (!bookCategory) {
            return res.status(404).json({
                success: false,
                message: 'book category not found.'
            });
        }
        console.log("bookCategory :", bookCategory);




        // // Check for required fields
        // if (!bookTitle || !authorName || !primaryCategory || !shortDescription || !longDescription || !imageUpload.url || !audioUpload.url) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "All fields are required"
        //     });
        // }


        // Create a new Banner instance
        const createBanner = await Banner.create({
            bookId: bookCategory._id, // Assign bookId as the _id of BookCategory
            status
        });
        console.log("createBanner: ", createBanner);
        // // Save the new banner to the database
        // const savedBanner = await createBanner.save();
        // console.log("savedBanner: ", savedBanner);

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
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

// const getBannerApi = async (req, res, next) => {
//     try {
//         const bannerBooks = await Banner.find()
//             .populate({
//                 path: 'bookId',
//                 model: 'Book', // Ensure 'Book' matches the model name for 'Book'
//                 select: 'bookTitle oblicAuthor authorName shortDescription longDescription series primaryCategory secondaryCategory pdfUpdate bookCoverImage',
//                 populate: {
//                     path: 'primaryCategory secondaryCategory',
//                     model: 'Category', // Assuming 'Category' is the model name for primary and secondary categories
//                     select: 'id name' // Select the fields you want to include in the response
//                 }
//             });
//         console.log("get all banner books", bannerBooks);

//         // Filter out banners where bookId is null
//         const bannersToDelete = bannerBooks.filter(banner => !banner.bookId);
//         console.log("bannersToDelete", bannersToDelete);

//         // If there are banners to delete, perform deletion
//         if (bannersToDelete.length > 0) {
//             await Banner.deleteMany({ _id: { $in: bannersToDelete.map(banner => banner._id) } });
//             console.log(`Deleted ${bannersToDelete.length} banners where bookId was null.`);
//         }

//         // Filter out null bookIds from the remaining bannerBooks
//         bannerBooks = bannerBooks.filter(banner => banner.bookId);

//         if (bannerBooks.length === 0) {
//             return res.status(404).json({ message: "No banner books found" });
//         }

//         res.status(200).json({
//             message: "Get all banners books succesfully", bannerBooks
//         })

//     } catch (error) {
//         console.log("error :", error);

//     }
// }

const getBannerApi = async (req, res, next) => {
    try {
        let bannerBooks = await Banner.find()
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

const deletebannerBooks = async (req, res, next) => {
    try {
        const deletedBannerBook = req.params.id
        console.log("deletedBannerBook: ", deletedBannerBook);

        // Agar category mil gayi toh delete karo
        await Banner.findByIdAndDelete(deletedBannerBook);

        res.status(200).json({ message: "Banner book deleted successfully" });


    } catch (error) {
        console.log("error :", error);
        // res.status(500).json({ message: err.message });

    }
}



module.exports = {
    createBannerApi,
    getBannerApi,
    deletebannerBooks
};