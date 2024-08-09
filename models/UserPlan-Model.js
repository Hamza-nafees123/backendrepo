const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userPlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment-Plan',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    remainingBookDownloads: {
      type: Number,
      required: true,
    },
    remainingAudioBookDownloads: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const UserPlan = mongoose.model("UserPlan", userPlanSchema);

module.exports = UserPlan;
