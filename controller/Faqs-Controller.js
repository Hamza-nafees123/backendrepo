const faqSchema = require("../models/FAQSCategory-Model.js");

const addFaqCategory = async (req, res) => {

    try {
        const { name } = req.body;
        const createFaqCategory = new faqSchema({
            name
        });

        await createFaqCategory.save();

        return res.status(201).json({
            message: "Faqs category created successfully",
            createFaqCategory,
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

const getAllFaqCategory = async (req, res) => {
    try {
        const getAllFaqs = await faqSchema.find();
        // console.log("getAllFaqs", getAllFaqs);
        res.status(200).json({ message: "Get all Faqs category", getAllFaqs });
    } catch (error) {
        console.log("error", error);
    }
};

const updateFaqCategory = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Data to update cannot be empty!",
        });
    }

    const { id } = req.params;

    try {
        const updatedFaqs = await faqSchema.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true, // Return the updated document
                useFindAndModify: false,
            }
        );
        // console.log("updatedFaqs :", updatedFaqs);
        if (!updatedFaqs) {
            return res.status(404).json({
                message: `Cannot update Faqs category with id=${id}. Maybe Faqs category was not found!`,
            });
        }

        res.status(200).json({
            message: "Faqs category was updated successfully.",
            updatedFaqs,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error updating Faqs category with id=${id}`,
            error: err.message,
        });
    }
};

const deleteFaqCategory = async (req, res, next) => {
    try {
        const deletedFaqId = req.params.id;
        // console.log("deletedFaqId: ", deletedFaqId);

        const deleteFaq = await faqSchema.findByIdAndDelete(
            deletedFaqId
        );
        // console.log("deleteFaq: ", deleteFaq);

        if (!deleteFaq) {
            return res.status(404).json({
                message: `Cannot delete coupon code with id=${deletedFaqId}. Maybe Faqs category was not found!`,
            });
        }

        res
            .status(200)
            .json({ message: "Faqs category deleted successfully", deleteFaq });
    } catch (error) {
        console.log("error :", error);
        res.status(500).json({
            message: `Could not delete Faqs category with id=${deletedFaqId}`,
            error: err.message,
        });
    }
};

module.exports = {
    addFaqCategory,
    getAllFaqCategory,
    updateFaqCategory,
    deleteFaqCategory
}; 