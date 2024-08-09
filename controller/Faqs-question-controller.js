const faqQuestionSchema = require("../models/FAQSQuestion-Model.js");
const FaqCategory = require("../models/FAQSCategory-Model.js");

const addFaqQuestion = async (req, res) => {

    try {
        const { question, answer, faqsCategoryId } = req.body;
        const createFaqQuestion = new faqQuestionSchema({
            question, answer, faqsCategoryId
        });

        await createFaqQuestion.save();

        return res.status(201).json({
            message: "Faqs question created successfully",
            createFaqQuestion,
        });
    } catch (error) {
        console.error("Error in Faqs category:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const getAllFaqQuestion = async (req, res) => {
    try {
        const getAllFaqsQuestion = await faqQuestionSchema.find().populate("faqsCategoryId", "id name");
        // console.log("getAllFaqsQuestion", getAllFaqsQuestion);
        res.status(200).json({ message: "Get all faqs question", getAllFaqsQuestion });
    } catch (error) {
        console.log("error", error);
    }
};

const updateFaqQuestion = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Data to update cannot be empty!",
        });
    }

    const { id } = req.params;

    try {
        const updatedFaqsQuestion = await faqQuestionSchema.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true, // Return the updated document
                useFindAndModify: false,
            }
        );
        // console.log("updatedFaqsQuestion :", updatedFaqsQuestion);
        if (!updatedFaqsQuestion) {
            return res.status(404).json({
                message: `Cannot update Faqs question with id=${id}. Maybe Faqs question was not found!`,
            });
        }

        res.status(200).json({
            message: "Faqs question was updated successfully.",
            updatedFaqsQuestion,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error updating Faqs question with id=${id}`,
            error: err.message,
        });
    }
};

const deleteFaqQuestion = async (req, res, next) => {
    try {
        const deletedFaqQestionId = req.params.id;
        console.log("deletedFaqQestionId: ", deletedFaqQestionId);

        const deleteFaq = await faqQuestionSchema.findByIdAndDelete(
            deletedFaqQestionId
        );
        // console.log("deleteFaq: ", deleteFaq);

        if (!deleteFaq) {
            return res.status(404).json({
                message: `Cannot delete faq question with id=${deletedFaqQestionId}. Maybe faq question was not found!`,
            });
        }

        res
            .status(200)
            .json({ message: "Faq question deleted successfully", deleteFaq });
    } catch (error) {
        console.log("error :", error);
        res.status(500).json({
            message: `Could not delete faq question with id=${deletedFaqQestionId}`,
            error: err.message,
        });
    }
};

const getAllFaqSingleIdData = async (req, res) => { 
    try {
        const faqId = req.params.id; // URL se ID lein
        // console.log("faqId :", faqId);
        const faqCategory = await FaqCategory.findById(faqId); // Database se ID ke mutabiq data fetch karein
        // console.log("faqCategory :", faqCategory);

        if (!faqCategory) {
            return res.status(404).json({ message: 'FAQ category not found' }); // Agar data na mile to 404 response dein
        }

        // Find all books with the given category ID and populate category details
        const getbooks = await faqQuestionSchema.find({ faqsCategoryId: faqId }).populate('faqsCategoryId', '_id name');
        // console.log("getbooks :", getbooks);

        if (!getbooks.length) {
            return res.status(404).json({ message: "No books found for this category" });
        }

        res.json({ messsage: "Get single faq question", getbooks }); // Mil gaya to JSON format mai response dein
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message }); // Error handling
    }

}


module.exports = {
    addFaqQuestion,
    getAllFaqQuestion,
    updateFaqQuestion,
    deleteFaqQuestion,
    getAllFaqSingleIdData
}; 