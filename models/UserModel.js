const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point", // Ensure default type is set to 'Point'
        required: true,
      },
      coordinates: { type: [Number], required: true },
    },
    // userMessage: {
    //   type: String,
    //   default: null,
    // },
    password: {
      type: String,
      required: true,
    },
    isSuspended: { type: Boolean, default: false },

    gender: {
      type: String,
      required: true,
    },

    paymentPlanId: {
      type: Schema.Types.ObjectId,
      ref: "Payment-Plan",
    },

    cardDetailsId: {
      type: Schema.Types.ObjectId,
      ref: "CardDetails",
    },
    remainingDownloads: {
      type: Number,
      default: 0,
    },
    downloadToken: {
      type: String,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    planExpiryDate: {
      // New field for plan expiry date
      type: Date,
    },

    cancelMemberShip: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Create a 2dsphere index on the location field
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);

module.exports = User;
