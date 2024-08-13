const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentPlanSchema = new Schema(
  {
    paymentPlan: {
      type: String,
      required: true,
    },
    whiteDescription: {
      type: String,
      required: true,
    },
    cutPrice: {
      type: Number,
      required: true,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    bookDownload: {
      type: Number,
      required: true,
      default: 0, // Default value added
    },
    audioBookDownload: {
      type: Number,
      required: true,
      default: 0, // Default value added
    },
    duration: {
      // New field for duration of the plan
      type: String, // Duration in months
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Payment-Plan", PaymentPlanSchema);

module.exports = Book;
