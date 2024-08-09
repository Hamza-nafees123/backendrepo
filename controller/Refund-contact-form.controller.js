const User = require("../models/UserModel.js");
const refundContactFrom = require("../models/Refund-Contact-Form-Model.js");

exports.addRefundContactForm = async (req, res) => {
  try {
    const { name, subject, message, userId } = req.body;

    if (!name || !subject || !message) {
      return res.status(400).json({ message: "Required Parameter missing" });
    }

    // Create new user instance
    const createrefundContact = new refundContactFrom({
      name,
      subject,
      message,
      userId
    });
    console.log("createrefundContact :", createrefundContact);

    // Save user to database
    await createrefundContact.save();
    // console.log("newUser: ", newUser);

    // Send success response with token
    res.status(201).json({
      message: "Refund contact form created successfully",
      createrefundContact,
    });
  } catch (error) {
    // Handle errors
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.getAllRefundsContactForm = async (req, res) => {
  try {
    const findAllRefundContactForm = await refundContactFrom.find().populate("userId");
    console.log("findAllRefundContactForm: ", findAllRefundContactForm);

    if (findAllRefundContactForm.length === 0) {
      return response.status(404).json({
        message: "Find all refund contact form not found",
        findAllRefundContactForm,
      });
    }
    res.status(200).json({
      message: "Get all refunds contact form",
      findAllRefundContactForm,
    });
  } catch (error) {
    console.log("get all refunds error: ", error);
  }
};

exports.deleteRefundContactForm = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("RefundContactForm id: ", id);

    const deleteRefund = await refundContactFrom.findByIdAndDelete(id);
    console.log("deleteRefund: ", deleteRefund);

    if (!deleteRefund) {
      return res.status(404).json({
        message: `Cannot delete refund contact form with id=${id}. Maybe refund contact form was not found!`,
      });
    }

    res.status(200).json({
      message: "Refunds contact form deleted successfully",
      deleteRefund,
    });
  } catch (error) {
    console.log("delete refunds error: ", error);
    res.status(500).json({
      message: `Could not delete refund contact form with id=${id}`,
      error: err.message,
    });
  }
};
