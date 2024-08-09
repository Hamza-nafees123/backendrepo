const mongoose = require('mongoose')
const Book = require('../models/BookModel.js');
// const recomendedSchema = require('../models/Recommeneded-Model.js');
const bookSchema = require('../models/BookModel.js');


// const createRecommendedBook = async (req, res, next) => {
//     try {
//         // Extract required fields from request body
//         const { bookId } = req.body;
//         // console.log("bookId :", bookId);

//         // Check if bookId is provided
//         if (!bookId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'book id is required.'
//             });
//         }


//         // Fetch primary category details
//         const bookCategory = await Book.findById(bookId);
//         if (!bookCategory) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'book not found.'
//             });
//         }
//         // console.log("bookCategory :", bookCategory);


//         const createRecommendedApi = await recomendedSchema.create({
//             bookId: bookCategory._id, // Assign bookId as the _id of BookCategory
//         });
//         // console.log("createRecommendedApi: ", createRecommendedApi);

//         res.status(201).json({
//             success: true,
//             message: "Recommended book created successfully",
//             createRecommendedApi
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create banner",
//             error: error.message // Optional: Send detailed error message
//         });
//     }
// }

// const getAllRecommendedBook = async (req, res, next) => {
//     try {

//         let recommendedBooks = await bookCategory.find()
//         // .populate("primaryCategory secondaryCategory", "id name")
//         res.status(200).json({
//             message: "Get all recommended books successfully",
//             recommendedBooks
//         });


//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }


const getAllRecommendedBook = async (req, res, next) => {
    try {
        let recommendedBooks = await bookSchema.aggregate([
            //Group by primaryCategory: Sabse pehle hum books ko unki primaryCategory field ke hisaab se group
            // karte hain aur har category ka pehla book select karte hain.
            {
                $group: {
                    _id: "$primaryCategory",
                    book: { $first: "$$ROOT" }
                }
            },
            //Lookup for Primary Category: Is stage main primaryCategory ka detail categories collection se join karte hain.
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "primaryCategoryDetails"
                }
            },
            //Unwind Primary Category: Is step main primaryCategoryDetails ko single object banate hain.
            {
                $unwind: "$primaryCategoryDetails"
            },
            //Lookup for Secondary Category: Is stage main secondaryCategory ka detail categories collection se join karte hain.
            {
                $lookup: {
                    from: "categories",
                    localField: "book.secondaryCategory",
                    foreignField: "_id",
                    as: "secondaryCategoryDetails"
                }
            },
            //Unwind Secondary Category: Is step main secondaryCategoryDetails ko single object banate hain.
            {
                $unwind: "$secondaryCategoryDetails"
            },
            //Project: Is stage main hum sirf required fields ko select karte hain aur primaryCategory aur secondaryCategory 
            //ke details ko object form main structure karte hain jisme id aur name include hote hain.
            {
                $project: {
                    _id: 0,
                    book: {
                        _id: 1,
                        bookTitle: 1,
                        oblicAuthor: 1,
                        authorName: 1,
                        primaryCategory: {
                            id: "$primaryCategoryDetails._id",
                            name: "$primaryCategoryDetails.name"
                        },
                        secondaryCategory: {
                            id: "$secondaryCategoryDetails._id",
                            name: "$secondaryCategoryDetails.name"
                        },
                        series: 1,
                        shortDescription: 1,
                        longDescription: 1,
                        bookCoverImage: 1,
                        pdfUpdate: 1,
                        epubUpload: 1,
                        kindleMobiUpload: 1,
                        bookRead: 1,
                        bookDownload: 1
                    }
                }
            }
        ]);

        res.status(200).json({
            message: "Get all recommended books successfully",
            recommendedBooks
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


// const deleteRecommendedBook = async (req, res, next) => {
//     try {
//         const recommendedBook = req.params.id
//         // console.log("recommendedBook: ", recommendedBook);

//         // Agar category mil gayi toh delete karo
//         await recomendedSchema.findByIdAndDelete(recommendedBook);

//         res.status(200).json({ message: "Recommended book deleted successfully" });


//     } catch (error) {
//         console.log("error :", error);
//         // res.status(500).json({ message: err.message });

//     }
// }












module.exports = {
    // createRecommendedBook,
    getAllRecommendedBook,
    // deleteRecommendedBook
};