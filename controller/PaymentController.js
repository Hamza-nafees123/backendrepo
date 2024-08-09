//function card details ko save karta hai, promo code ka discount apply karta hai aur user ke plan ko update karta hai.
//cancelMembership function user ke membership aur card details ko cancel karta hai aur database se remove karta hai.

const User = require("../models/UserModel.js");
// const PaymentPlan = require('../models/Payment-Plan-Model.js');
const paymentPlanModel = require("../models/Payment-Plan-Model.js");
const CouponCodeDiscount = require("../models/Promo-code-Model.js");
const CardDetails = require("../models/Card-Details-Model.js");
const CancelMembership = require("../models/Cancel-Member-Ship-Model.js");
const crypto = require("crypto"); // Token generate karne ke liye
const AudioBook = require("../models/Audio-Books.Model.js");
const Book = require("../models/BookModel");
const mongoose = require("mongoose");
const cron = require("node-cron");

// const processPayment = async (req, res) => {
//     const { userId, paymentPlanId, cardDetails, promoCode } = req.body;

//     try {
//         const user = await User.findById(userId); // User ko find kar raha hai database se
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }
//         const plan = await PaymentPlan.findById(paymentPlanId); // Payment plan ko find kar raha hai database se

//         if (!plan) {
//             return res.status(404).json({ message: "Payment plan not found." });
//         }

//         //Plan ki price ko finalPrice me set karta hai.
//         let finalPrice = parseFloat(plan.actualPrice); // Initial price ko set kar raha hai plan ki actual price par
//         console.log("finalPrice :", finalPrice);

//         //Agar promoCode diya gaya hai, to yeh check karta hai:
//         //Promo code ko CouponCodeDiscount collection se find karta hai.
//         //Agar promo code valid hai aur expire nahi hua hai, to finalPrice me discount apply karta hai
//         if (promoCode) {
//             // Agar promo code hai to
//             const promo = await CouponCodeDiscount.findOne({
//                 couponCodeName: promoCode,
//             }); // Promo code ko find kar raha hai
//             console.log("promoCode :", promo);

//             if (!promo) {
//                 return res.status(404).json({ message: "Promo code not found" });
//             }

//             // Check karte hain agar audioBookDownload ki value defined hai
//             if (plan.audioBookDownload === undefined) {
//                 console.error("audioBookDownload undefined hai");
//                 return res
//                     .status(400)
//                     .json({ message: "audioBookDownload payment plan mein missing hai" });
//             }

//             if (promo && new Date() <= promo.endDate) {
//                 // Agar promo valid hai to
//                 // Convert discount percentage to number and apply discount
//                 const discountPercent = parseFloat(promo.discount.replace("%", ""));
//                 console.log("discountPercent :", discountPercent);
//                 finalPrice -= finalPrice * (discountPercent / 100); // Apply discount
//                 console.log("Discount Applied:", finalPrice);
//             } else {
//                 return res
//                     .status(400)
//                     .json({ message: "Invalid or expired promo code." }); // Invalid promo code error
//             }
//         }

//         const card = new CardDetails({
//             cardNumber: cardDetails.cardNumber,
//             nameOfCard: cardDetails.nameOfCard,
//             expiryDate: cardDetails.expiryDate,
//             cvv: cardDetails.cvv,
//             userId: user._id,
//             plan: plan.paymentPlan,
//         });
//         console.log("card:", card);
//         console.log("Plan:", plan);
//         console.log("Initial Price:", finalPrice);

//         await card.save(); // Card details ko save kar raha hai database mein

//         //User ko update karta hai new payment plan, new card details, aur updated remaining downloads ke sath.
//         user.paymentPlanId = plan._id; // User model mein plan ID save kar raha hai
//         user.remainingDownloads = plan.bookDownload; // User model mein remaining downloads set kar raha hai
//         user.remainingDownloads = plan.audioBookDownload; // User model mein remaining downloads set kar raha hai
//         user.cardDetailsId = card._id; // User model mein card details ID save kar raha hai

//         await user.save(); // User details ko save kar raha hai database mein

//         // Check updated values
//         console.log("Updated User Payment Plan ID:", user.paymentPlanId);
//         console.log("Updated User Remaining Downloads:", user.remainingDownloads);
//         console.log("Updated User Remaining Downloads:", user?.audioBookDownload);
//         console.log("Updated User Card Details ID:", user.cardDetailsId);

//         // Card processing ko simulate kar raha hai
//         console.log(`Processing payment for card number ${cardDetails.cardNumber}`);

//         res
//             .status(200)
//             .json({ message: "Payment processed successfully.", finalPrice }); // Success message send kar raha hai
//     } catch (error) {
//         res.status(500).json({ message: "Error processing payment.", error }); // Error handle kar raha hai
//     }
// };

const buyAndProcessPayment = async (req, res) => {
  try {
    const { userId, paymentPlanId, cardDetails, promoCode } = req.body;
    console.log("userId, paymentPlanId, cardDetails, promoCode :", req.body);

    // User aur Plan ko find karo
    const user = await User.findById(userId).populate("paymentPlanId");
    console.log("login user :", user);
    const newPlan = await paymentPlanModel.findById(paymentPlanId);
    console.log("newPlan :", newPlan);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!newPlan) return res.status(404).json({ message: "Plan not found" });

    // // Validate duration
    // const durationInMonths = parseInt(newPlan.duration, 10);
    // if (isNaN(durationInMonths) || durationInMonths <= 0) {
    //     return res.status(400).json({ message: "Invalid duration" });
    // }
    // console.log("durationInMonths: ", durationInMonths);

    // Agar promoCode diya hai, to uski discount ko check karte hain aur final price ko update karte hain.
    let finalPrice = parseFloat(newPlan.actualPrice);
    console.log("finalPrice :", finalPrice);

    if (promoCode) {
      const promo = await CouponCodeDiscount.findOne({
        couponCodeName: promoCode,
      });
      console.log("promo code name:", promo);

      if (promo && new Date() <= promo.endDate) {
        const discountPercent = parseFloat(promo.discount.replace("%", ""));
        console.log("discountPercent :", discountPercent);
        finalPrice -= finalPrice * (discountPercent / 100);
        console.log("Discount Applied:", finalPrice);
      } else {
        return res
          .status(400)
          .json({ message: "Invalid or expired promo code." });
      }
    }

    // Agar user ke pass purane card details hain, to unko delete karte hain.
    if (user.cardDetailsId) {
      await CardDetails.findByIdAndDelete(user.cardDetailsId);
    }

    // Card details save karo
    const card = new CardDetails({
      cardNumber: cardDetails.cardNumber,
      nameOfCard: cardDetails.nameOfCard,
      expiryDate: cardDetails.expiryDate,
      cvv: cardDetails.cvv,
      userId: user._id,
      plan: newPlan.paymentPlan,
    });
    await card.save();

    // Agar user ka pehla plan hai to uske download counts new plan mein add karo:
    if (user.paymentPlanId) {
      const previousPlan = user.paymentPlanId;
      console.log("previousPlan:", previousPlan);
      // Update new plan's downloads by adding previous plan's downloads
      newPlan.bookDownload += previousPlan.bookDownload || 0;
      newPlan.audioBookDownload += previousPlan.audioBookDownload || 0;
      // await paymentPlanModel.findByIdAndUpdate(previousPlan._id);

      // Instead of deleting the plan, just update the plan
      await paymentPlanModel.findByIdAndUpdate(previousPlan._id, {
        bookDownload: newPlan.bookDownload,
        audioBookDownload: newPlan.audioBookDownload,
      });
    }

    // User ke remaining downloads update karo
    user.remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;

    // // User ke remaining downloads new plan ke counts se update karo:
    // const newPlanBookDownloads = newPlan.bookDownload || 0;
    // const newPlanAudioBookDownloads = newPlan.audioBookDownload || 0;
    // user.remainingDownloads = newPlanBookDownloads + newPlanAudioBookDownloads;

    // console.log("remainingDownloads: ", remainingDownloads);
    // console.log("newPlanBookDownloads: ", newPlanBookDownloads);
    // console.log("newPlanAudioBookDownloads: ", newPlanAudioBookDownloads);

    // User ke remaining downloads update karo aur expiry date set karo
    // user.remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;
    const currentDate = new Date();
    const expiryDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + newPlan.duration)
    );
    user.planExpiryDate = expiryDate;
    user.paymentPlanId = paymentPlanId;
    user.autoRenew = !!user.cardDetailsId;
    user.downloadToken = crypto.randomBytes(50).toString("hex");
    user.cardDetailsId = card._id;

    // Updated user ko save karo
    await user.save();
    await newPlan.save();

    res.status(200).json({
      message: "New plan purchased and payment processed successfully",
      user,
    });
  } catch (error) {
    console.log("Error in buyAndProcessPayment:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// const cancelMembership = async (req, res) => {
//     const { userId, reason, anyMessage } = req.body;

//     try {
//         const user = await User.findById(userId); // User ko find kar raha hai database se

//         await CardDetails.findByIdAndDelete(user.cardDetailsId); // User ke card details ko delete kar raha hai

//         user.paymentPlanId = null; // User model mein plan ID null kar raha hai
//         user.remainingDownloads = 0; // User model mein remaining downloads ko reset kar raha hai
//         user.cardDetailsId = null; // User model mein card details ID null kar raha hai

//         const cancelDetails = new CancelMembership({
//             userId,
//             reason,
//             anyMessage
//         });

//         await user.save(); // User details ko save kar raha hai database mein
//         await cancelDetails.save(); // Cancel membership details ko save kar raha hai

//         res.status(200).json({ message: 'Membership cancelled successfully.' }); // Success message send kar raha hai

//     } catch (error) {
//         res.status(500).json({ message: 'Error cancelling membership.', error }); // Error handle kar raha hai
//     }
// };

const getAllCancelMemberShip = async (req, res) => {
  try {
    // Fetch all cancelled memberships and populate user details
    const cancelMemberships = await CancelMembership.find().populate("userId");
    res.status(200).json({
      status: true,
      message: "All Cancel Memberships fetched successfully",
      data: cancelMemberships,
    });
  } catch (error) {
    console.error("Error in getAllCancelMemberShip:", error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getAllRemaningBooks = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("userId: ", userId);

    // User ko find karo aur uska plan populate karo
    const user = await User.findById(userId).populate("paymentPlanId");
    console.log("login user: ", user);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Current plan details retrieve karo
    const currentPlan = await paymentPlanModel.findById(user.paymentPlanId._id);
    console.log("currentPlan: ", currentPlan);

    if (!currentPlan)
      return res.status(404).json({ message: "Plan not found" });

    // Response data prepare karo
    const responseData = {
      userId: user._id,
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
      },
      currentPlan: {
        paymentPlan: currentPlan.paymentPlan,
        duration: currentPlan.duration,
        cutPrice: currentPlan.cutPrice,
        actualPrice: currentPlan.actualPrice,
        remainingDownloads: user.remainingDownloads,
        bookDownload: currentPlan.bookDownload,
        audioBookDownload: currentPlan.audioBookDownload,
      },
      // downloads: {
      //     bookDownload: user.bookDownload, // Example: Actual field ko replace karen
      //     audioBookDownload: user.audioBookDownload, // Example: Actual field ko replace karen
      // }
    };

    // Response send karo
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in GET /user/:userId/downloads:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Membership cancel function
const cancelMembership = async (req, res) => {
  try {
    const { userId, reason, anyMessage } = req.body;
    console.log("userId, reason, anyMessage: ", req.body);

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId provided." });
    }

    const user = await User.findById(userId).populate("paymentPlanId"); // Populate to get plan details
    console.log("cancel member ship user: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user && user.paymentPlanId) {
      // Plan ka duration retrieve karen
      const planDuration = user.paymentPlanId.duration; // Assuming duration is in days
      console.log("cancel member ship user duration: ", planDuration);

      // Plan expiry date set karo
      user.planExpiryDate = new Date(
        Date.now() + planDuration * 24 * 60 * 60 * 1000
      );
      user.cancelMemberShip = true;
      console.log(
        "cancel membership user planExpiryDate: ",
        user.planExpiryDate
      );

      await user.save();

      // Save cancellation details
      const cancellation = new CancelMembership(req.body);
      await cancellation.save();
      console.log("cancellation: ", cancellation);

      res
        .status(200)
        .json({ message: "message  created successfully", cancellation });
    }
  } catch (error) {
    console.error("Error canceling membership:", error.message);
  }
};

// Scheduler setup for checking expired plans
cron.schedule("0 0 * * *", async () => {
  // Runs every day at midnight
  try {
    const expiredUsers = await User.find({
      cancelMemberShip: true,
      planExpiryDate: { $lte: new Date() },
    });
    console.log("cancel member ship expiredUsers: ", expiredUsers);

    if (expiredUsers.length > 0) {
      expiredUsers.forEach(async (user) => {
        user.paymentPlanId = null;
        user.remainingDownloads = 0;
        user.cardDetailsId = null;
        user.autoRenew = false;
        await user.save();
      });
      console.log(`${expiredUsers.length} user(s) plan reset due to expiry.`);
    }
  } catch (error) {
    console.error("Error checking expired plans:", error.message);
  }
});

module.exports = {
  buyAndProcessPayment,
  cancelMembership,
  getAllCancelMemberShip,
  getAllRemaningBooks,
  cancelMembership,
};
