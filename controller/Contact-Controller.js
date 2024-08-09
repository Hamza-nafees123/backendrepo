const contactSchema = require("../models/Contact-Model.js");

const createContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const createContact = new contactSchema({
            name,
            email,
            message
        });

        // console.log("createContact :", createContact);

        // PromoCode save karte hain
        await createContact.save();

        // Return success response
        return res.status(201).json({
            message: "Contact created successfully",
            createContact,
        });
    } catch (error) {
        // Handle errors
        console.error("Error in Conatact:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const findAllContacts = await contactSchema.find();
        if (!findAllContacts) {
            return res.status(404).json({ message: "Conatcts not found" })

        }
        res.status(200).json({ message: "Get all contacts successfully", findAllContacts })
    } catch (error) {

    }
}

const deleteSingleContact = async (req, res, next) => {
    try {
        const deletedContactId = req.params.id;
        // console.log("deletedContactId: ", deletedContactId);

        const deleteContact = await contactSchema.findByIdAndDelete(
            deletedContactId
        );
        // console.log("deleteContact: ", deleteContact);

        if (!deleteContact) {
            return res.status(404).json({
                message: `Cannot delete contact with id=${deletedContactId}. Maybe contact was not found!`,
            });
        }

        res
            .status(200)
            .json({ message: "Contact deleted successfully", deleteContact });
    } catch (error) {
        console.log("error :", error);
        res.status(500).json({
            message: `Could not delete contact with id=${deletedContactId}`,
            error: err.message,
        });
    }
};


module.exports = {
    createContactForm,
    getAllContacts,
    deleteSingleContact
}