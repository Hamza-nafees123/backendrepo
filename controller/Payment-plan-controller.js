//Plan Create Karne Ki API: Pehle hum sirf payment plan ki details ko save karenge, aur download limits ko is stage pe set nahi karenge.
//User Plan Buy Karne Ki API: Jab user plan buy karega, hum uski download limits ko us plan ke mutabiq set karenge. Yeh API user ka plan update karegi aur download limits set karegi.
//Book Download Karne Ki API: Jab user book download karega, hum check karenge ke uski download limit poori hui hai ya nahi. Agar poori ho gayi to message denge ke "Download limit reached, please upgrade your plan". Agar limit poori nahi hui to user download kar sakega aur uski remaining downloads increment ho jayegi.

// const mongoose = require('mongoose')
const paymentPlanModel = require("../models/Payment-Plan-Model.js");
const User = require("../models/UserModel.js");
const AudioBookModel = require("../models/Audio-Books.Model.js");
const BookModel = require("../models/BookModel.js");
const crypto = require("crypto"); // Token generate karne ke liye
const dotenv = require("dotenv");
// const cron = require("node-cron");

dotenv.config();

const createPaymentPlan = async (req, res) => {
  try {
    const {
      paymentPlan,
      whiteDescription,
      cutPrice,
      actualPrice,
      audioBookDownload,
      bookDownload,
      duration,
    } = req.body;

    const newPlan = new paymentPlanModel({
      paymentPlan,
      whiteDescription,
      cutPrice,
      actualPrice,
      audioBookDownload,
      bookDownload,
      duration,
    });

    const savedPlan = await newPlan.save();
    res
      .status(201)
      .json({ message: "Payment plan created successfully", savedPlan });
  } catch (error) {
    console.log("Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// const buyPlan = async (req, res) => {
//   try {
//     //User ID aur Payment Plan ID fetch karo:
//     const userId = req.user.id;
//     const { paymentPlanId } = req.body;

//     // User aur new plan database se fetch karo:
//     const user = await User.findById(userId).populate("paymentPlanId");
//     const newPlan = await paymentPlanModel.findById(paymentPlanId);

//     //User aur new plan check karo:
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!newPlan) return res.status(404).json({ message: "Plan not found" });

//     // Agar user ka pehla plan hai to uske download counts new plan mein add karo:
//     if (user.paymentPlanId) {
//       const previousPlan = user.paymentPlanId;
//       console.log("previousPlan: ", previousPlan);
//       // Update new plan's downloads by adding previous plan's downloads
//       newPlan.bookDownload += previousPlan.bookDownload || 0;
//       newPlan.audioBookDownload += previousPlan.audioBookDownload || 0;

//       // Remove the previous plan from the database
//       await paymentPlanModel.findByIdAndDelete(previousPlan._id);
//     }

//     // User ke remaining downloads new plan ke counts se update karo:
//     const newPlanBookDownloads = newPlan.bookDownload || 0;
//     const newPlanAudioBookDownloads = newPlan.audioBookDownload || 0;
//     user.remainingDownloads = newPlanBookDownloads + newPlanAudioBookDownloads;

//     // Plan expiry date set karo:
//     const currentDate = new Date();
//     console.log("currentDate :", currentDate);
//     const planDurationInMonths = newPlan.duration; // assuming duration is in months
//     console.log("planDurationInMonths :", planDurationInMonths);
//     const expiryDate = new Date(
//       currentDate.setMonth(currentDate.getMonth() + planDurationInMonths)
//     );
//     user.planExpiryDate = expiryDate;
//     console.log("aexpiryDate :", expiryDate);

//     // User ko new plan details ke sath update karo:
//     user.paymentPlanId = paymentPlanId;
//     user.autoRenew = !!user.cardDetailsId;
//     user.downloadToken = crypto.randomBytes(50).toString("hex");

//     // Updated user ko save karo:
//     // const updatedUser = await User.findByIdAndUpdate(
//     //   userId,
//     //   {
//     //     paymentPlan: user.paymentPlan,
//     //     whiteDescription: user.whiteDescription,
//     //     cutPrice: user.cutPrice,
//     //     actualPrice: user.actualPrice,
//     //     audioBookDownload: user.audioBookDownload,
//     //     bookDownload: user.bookDownload,
//     //   },
//     //   { new: true }
//     // );
//     // console.log("updatedUser: , updatedUser");
//     // Save the updated user and new plan

//     await user.save();
//     await newPlan.save(); // Ensure the new plan is saved with updated download counts

//     res
//       .status(200)
//       .json({ message: "New plan purchased successfully", user });
//   } catch (error) {
//     console.log("Error in buyPlan:", error);
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: error.message });
//   }
// };

const downloadBook = async (req, res) => {
  try {
    const token = req.header("Authorization");
    const { downloadType } = req.body; // Array of download types like ['bookDownload', 'audioBookDownload']

    if (!token)
      return res
        .status(401)
        .json({ message: "Authorization token is required" });
    if (
      !Array.isArray(downloadType) ||
      downloadType.length === 0 ||
      !downloadType.every((type) =>
        ["bookDownload", "audioBookDownload"].includes(type)
      )
    ) {
      return res
        .status(400)
        .json({ message: "Valid download types are required" });
    }

    const user = await User.findOne({ downloadToken: token }).populate(
      "paymentPlanId"
    );

    if (!user)
      return res
        .status(403)
        .json({ message: "Invalid or expired token Please buy a plan" });


    let totalDownloadsToDeduct = 0;

    // Deduct downloads based on type
    for (const type of downloadType) {
      if (type === "bookDownload") {
        if (user.paymentPlanId.bookDownload > 0) {
          user.paymentPlanId.bookDownload -= 1;
          totalDownloadsToDeduct += 1;
        } else {
          return res
            .status(403)
            .json({ message: "All book downloads have been used" });
        }
      } else if (type === "audioBookDownload") {
        if (user.paymentPlanId.audioBookDownload > 0) {
          user.paymentPlanId.audioBookDownload -= 1;
          totalDownloadsToDeduct += 1;
        } else {
          return res
            .status(403)
            .json({ message: "All audio book downloads have been used" });
        }
      }
    }

    if (user.remainingDownloads <= 0)
      return res.status(403).json({ message: "Please upgrade your plan" });

    // // Deduct downloads based on type
    // downloadType.forEach((type) => {
    //   if (type === "bookDownload") {
    //     if (user.paymentPlanId.bookDownload > 0) {
    //       user.paymentPlanId.bookDownload -= 1;
    //       totalDownloadsToDeduct += 1;
    //     }
    //   } else if (type === "audioBookDownload") {
    //     if (user.paymentPlanId.audioBookDownload > 0) {
    //       user.paymentPlanId.audioBookDownload -= 1;
    //       totalDownloadsToDeduct += 1;
    //     }
    //   }
    // });

    user.remainingDownloads -= totalDownloadsToDeduct;

    await user.paymentPlanId.save();
    await user.save();

    // Check if a new plan needs to be applied
    const currentDate = new Date();
    const lastPlanDate = new Date(user.updatedAt);
    const planDuration = user.paymentPlanId.duration; // Assuming duration is in months
    const nextRenewalDate = new Date(
      lastPlanDate.setMonth(lastPlanDate.getMonth() + planDuration)
    );

    if (
      user.remainingDownloads <= 0 &&
      user.cardDetailsId &&
      currentDate >= nextRenewalDate
    ) {
      // Reset to new plan downloads
      user.remainingDownloads =
        user.paymentPlanId.bookDownload + user.paymentPlanId.audioBookDownload;
      user.downloadToken = crypto.randomBytes(50).toString("hex");
      user.updatedAt = new Date();
      await user.save();
    }

    // // Fetch all books and audio books data
    // const books = await BookModel.find();
    // const audioBooks = await AudioBookModel.find();

    res.status(200).json({
      message: "Download(s) processed successfully",
      remainingDownloads: user.remainingDownloads,
      bookDownload: user.paymentPlanId.bookDownload,
      audioBookDownload: user.paymentPlanId.audioBookDownload,
      // books: user.paymentPlanId.bookDownload > 0 ? books : [],
      // audioBooks: user.paymentPlanId.audioBookDownload > 0 ? audioBooks : [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing download", error: error.message });
  }
};

const getAllPaymentPlans = async (req, res, next) => {
  try {
    const getAllPlans = await paymentPlanModel.find();
    console.log("getAllPlans: ", getAllPlans);

    if (getAllPlans.length === 0) {
      return res.status(404).json({ message: "Payment plan not found" });
    }
    res
      .status(200)
      .json({ message: "Get all payment plan successfully", getAllPlans });
  } catch (error) {
    console.log("error: ", error);
  }
};

const updatePaymentPlan = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: "Data to update cannot be empty!",
    });
  }

  const { id } = req.params;

  try {
    const updatedPlan = await paymentPlanModel.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      useFindAndModify: false,
    });
    console.log("updatedPlan :", updatedPlan);
    if (!updatedPlan) {
      return res.status(404).json({
        message: `Cannot update payment plan with id=${id}. Maybe payment plan was not found!`,
      });
    }

    res
      .status(200)
      .json({ message: "Payment plan was updated successfully.", updatedPlan });
  } catch (err) {
    res.status(500).json({
      message: `Error updating payment plan with id=${id}`,
      error: err.message,
    });
  }
};

const deletePaymentPlan = async (req, res, next) => {
  try {
    const deletedplanId = req.params.id;
    console.log("deletedplanId: ", deletedplanId);

    // Agar category mil gayi toh delete karo
    const deletePlan = await paymentPlanModel.findByIdAndDelete(deletedplanId);
    console.log("deletePlan: ", deletePlan);

    if (!deletePlan) {
      return res.status(404).json({
        message: `Cannot delete payment plan with id=${deletedplanId}. Maybe payment plan was not found!`,
      });
    }

    res
      .status(200)
      .json({ message: "Payment plan deleted successfully", deletePlan });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      message: `Could not delete payment plan with id=${deletedplanId}`,
      error: err.message,
    });
  }
};

const getCheckPaymentPlan = async (req, res) => {
  try {
    const userId = req.params.userId;
   console.log("userId: ", userId);
   
    // Find the user by ID
    const user = await User.findById(userId).populate('paymentPlanId');
    console.log("user: ", user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has a payment plan
    let paymentPlanId = null;
    let cancelMemberShip = false;

    if (user.paymentPlanId) {
      paymentPlanId = user.paymentPlanId._id;

      // Check if the plan has ended
      const now = new Date();
      if (user.paymentPlanId.planExpiryDate < now) {
        cancelMemberShip = true;
      }
    }

    res.status(200).json({ paymentPlanId, cancelMemberShip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};






module.exports = {
  createPaymentPlan,
  getAllPaymentPlans,
  updatePaymentPlan,
  deletePaymentPlan,
  getCheckPaymentPlan,
  // buyPlan,
  downloadBook,
  //   autoRenewPlans,
  // buyNewPlan,
  // renewPlan,
};
