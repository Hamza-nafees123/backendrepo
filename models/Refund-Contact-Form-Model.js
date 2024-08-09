const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const refundcontactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //   required: true,
    },
    subject: {
      type: String,
      //   required: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const refundContactFrom = mongoose.model("RefundContactForm", refundcontactSchema);

module.exports = refundContactFrom;
