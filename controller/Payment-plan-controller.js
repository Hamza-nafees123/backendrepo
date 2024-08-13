//Plan Create Karne Ki API: Pehle hum sirf payment plan ki details ko save karenge, aur download limits ko is stage pe set nahi karenge.
//User Plan Buy Karne Ki API: Jab user plan buy karega, hum uski download limits ko us plan ke mutabiq set karenge. Yeh API user ka plan update karegi aur download limits set karegi.
//Book Download Karne Ki API: Jab user book download karega, hum check karenge ke uski download limit poori hui hai ya nahi. Agar poori ho gayi to message denge ke "Download limit reached, please upgrade your plan". Agar limit poori nahi hui to user download kar sakega aur uski remaining downloads increment ho jayegi.

// const mongoose = require('mongoose')
const paymentPlanModel = require("../models/Payment-Plan-Model.js");
const User = require("../models/UserModel.js");
const AudioBookModel = require("../models/Audio-Books.Model.js");
const BookModel = require("../models/BookModel.js");
// const crypto = require("crypto"); // Token generate karne ke liye
const dotenv = require("dotenv");
const CouponCodeDiscount = require("../models/Promo-code-Model.js");
const crypto = require("crypto"); // Token generate karne ke liye
const cron = require("node-cron");
const cardValidator = require("card-validator");
const CardDetails = require("../models/Card-Details-Model.js");

dotenv.config();

const parseDuration = (durationStr) => {
  if (typeof durationStr !== "string") {
    throw new Error(
      'Invalid duration format. The duration must be a string like "1 month" or "30 minutes".'
    );
  }

  const [value, unit] = durationStr.toLowerCase().split(" ");
  const duration = parseInt(value, 10);

  if (isNaN(duration) || (unit !== "month" && unit !== "minutes")) {
    throw new Error('Invalid duration format. Use "X month" or "Y minutes".');
  }

  return { duration, unit };
};

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

    // Validate duration
    parseDuration(duration); // Agar invalid hoga toh error throw hoga

    const newPlan = new paymentPlanModel({
      paymentPlan,
      whiteDescription,
      cutPrice,
      actualPrice,
      audioBookDownload,
      bookDownload,
      duration: duration, // Store duration as a string
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

// const getCheckPaymentPlan = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log("userId:", userId);

//     // User ko find karo aur paymentPlanId ko populate karo
//     const user = await User.findById(userId).populate("paymentPlanId");
//     console.log("user:", user);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     let paymentPlanId = null;
//     let cancelMemberShip = false;

//     if (user.paymentPlanId) {
//       paymentPlanId = user.paymentPlanId._id;

//       // Debugging
//       console.log("paymentPlanId object:", user.paymentPlanId);

//       // Validate and parse the expiry date
//       const expiryDateStr =  user.planExpiryDate || (user.paymentPlanId && user.paymentPlanId.planExpiryDate);;
//       console.log("expiryDateStr:", expiryDateStr);

//       if (!expiryDateStr) {
//         throw new Error("planExpiryDate field is missing or undefined");
//       }

//       const expiryDate = new Date(expiryDateStr);
//       const now = new Date(); // Current UTC time

//       // Debugging
//       console.log("Plan Expiry Date:", expiryDate.toISOString());
//       console.log("Current Date:", now.toISOString());
//       console.log("Is Plan Expired?", cancelMemberShip);

//       // Check if the plan has expired
//       cancelMemberShip = expiryDate < now;

//         // Debugging
//         console.log("Is Plan Expired?", cancelMemberShip);
//     }

//     res.status(200).json({ paymentPlanId, cancelMemberShip });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // Card Details Validation Function
// const validateCardDetails = (cardDetails) => {
//   const numberValidation = cardValidator.number(cardDetails.cardNumber);
//   console.log("numberValidation: ", numberValidation);
//   const expiryValidation = cardValidator.expirationDate(cardDetails.expiryDate);
//   console.log("expiryValidation: ", expiryValidation);
//   const cvvValidation = cardValidator.cvv(cardDetails.cvv);
//   console.log("cvvValidation: ", cvvValidation);

//   if (!numberValidation.isValid) {
//     throw new Error("Invalid card number.");
//   }
//   if (!expiryValidation.isValid) {
//     throw new Error("Invalid expiry date.");
//   }
//   if (!cvvValidation.isValid) {
//     throw new Error("Invalid CVV.");
//   }
// };

// // Simulated Payment Processing Function
// const processPayment = async (cardDetails, amount) => {
//   // Yeh simulated function hai. Real-world mein yahan payment gateway integrate hoga.
//   // Abhi hum assume karte hain ke card mein hamesha sufficient funds hain.
//   // Agar funds insufficient honge toh error throw karenge.

//   // For simulation, let's assume cards ending with '0000' have insufficient funds
//   if (cardDetails.cardNumber.endsWith("0000")) {
//     throw new Error("Insufficient funds in the card.");
//   }

//   // Payment successful
//   return true;
// };

// const buyAndProcessPayment = async (req, res) => {
//   try {
//     const { userId, paymentPlanId, cardDetails, promoCode } = req.body;
//     console.log("userId, paymentPlanId, cardDetails, promoCode :", req.body);

//     // User aur Plan ko find karo
//     const user = await User.findById(userId).populate("paymentPlanId");
//     console.log("login user :", user);
//     const newPlan = await paymentPlanModel.findById(paymentPlanId);
//     console.log("newPlan :", newPlan);

//     if (!user || !newPlan)
//       return res.status(404).json({ message: "User or Plan not found" });

//     // Duration parse karo
//     const { duration, unit } = parseDuration(newPlan.duration);
//     console.log("duration, unit: ", newPlan.duration);

//     // Agar promoCode diya hai, to uski discount ko check karte hain aur final price ko update karte hain.
//     let finalPrice = parseFloat(newPlan.actualPrice);
//     console.log("finalPrice :", finalPrice);

//     if (promoCode) {
//       const promo = await CouponCodeDiscount.findOne({
//         couponCodeName: promoCode,
//       });
//       console.log("promo code name:", promo);

//       if (promo && new Date() <= promo.endDate) {
//         const discountPercent = parseFloat(promo.discount.replace("%", ""));
//         console.log("discountPercent :", discountPercent);
//         finalPrice -= finalPrice * (discountPercent / 100);
//         console.log("Discount Applied:", finalPrice);
//       } else {
//         return res
//           .status(400)
//           .json({ message: "Invalid or expired promo code." });
//       }
//     }

//     // Card details validate karo
//     validateCardDetails(cardDetails);

//     // Payment process karo
//     await processPayment(cardDetails, finalPrice);

//     // Agar user ke pass purane card details hain, to unko delete karte hain.
//     if (user.cardDetailsId) {
//       await CardDetails.findByIdAndDelete(user.cardDetailsId);
//     }

//     // Card details save karo
//     const card = new CardDetails({
//       cardNumber: cardDetails.cardNumber,
//       nameOfCard: cardDetails.nameOfCard,
//       expiryDate: cardDetails.expiryDate,
//       cvv: cardDetails.cvv,
//       userId: user._id,
//       plan: newPlan.paymentPlan,
//     });
//     await card.save();

//     // Agar user ka pehla plan hai to uske download counts new plan mein add karo:
//     if (user.paymentPlanId) {
//       const previousPlan = user.paymentPlanId;
//       console.log("previousPlan:", previousPlan);
//       // Update new plan's downloads by adding previous plan's downloads
//       newPlan.bookDownload += previousPlan.bookDownload || 0;
//       newPlan.audioBookDownload += previousPlan.audioBookDownload || 0;
//       // await paymentPlanModel.findByIdAndUpdate(previousPlan._id);

//       // Instead of deleting the plan, just update the plan
//       await paymentPlanModel.findByIdAndUpdate(previousPlan._id, {
//         bookDownload: newPlan.bookDownload,
//         audioBookDownload: newPlan.audioBookDownload,
//       });
//       console.log(
//         "Updated previous plan with new download counts",
//         previousPlan
//       );
//     }

//     // User ke remaining downloads update karo
//     user.remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;

//     // // User ke remaining downloads new plan ke counts se update karo:
//     // const newPlanBookDownloads = newPlan.bookDownload || 0;
//     // const newPlanAudioBookDownloads = newPlan.audioBookDownload || 0;
//     // user.remainingDownloads = newPlanBookDownloads + newPlanAudioBookDownloads;

//     // console.log("remainingDownloads: ", remainingDownloads);
//     // console.log("newPlanBookDownloads: ", newPlanBookDownloads);
//     // console.log("newPlanAudioBookDownloads: ", newPlanAudioBookDownloads);

//     // User ke remaining downloads update karo aur expiry date set karo
//     // user.remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;

//     // const currentDate = new Date();
//     // console.log("currentDate: ", currentDate);
//     // const expiryDate = new Date(
//     //   currentDate.setMonth(currentDate.getMonth() + newPlan.duration)
//     // );
//     // console.log("expiryDate: ", expiryDate);
//     // user.planExpiryDate = expiryDate;
//     // user.paymentPlanId = paymentPlanId;
//     // user.autoRenew = !!user.cardDetailsId;
//     // user.downloadToken = crypto.randomBytes(50).toString("hex");
//     // user.cardDetailsId = card._id;

//     // Plan expiry date set karo
//     const currentDate = new Date();
//     let expiryDate;
//     if (unit === "month") {
//       expiryDate = new Date(
//         currentDate.setMonth(currentDate.getMonth() + duration)
//       );
//     } else if (unit === "minutes") {
//       expiryDate = new Date(currentDate.getTime() + duration * 60000);
//     }

//     // User details update karo
//     user.planExpiryDate = expiryDate;
//     user.paymentPlanId = paymentPlanId;
//     user.autoRenew = true; // Assume karo user ne auto-renew on rakha hai
//     user.downloadToken = crypto.randomBytes(50).toString("hex");
//     user.cardDetailsId = card._id;
//     user.remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;

//     // Updated user ko save karo
//     await user.save();
//     await newPlan.save();

//     res.status(200).json({
//       message: "New plan purchased and payment processed successfully",
//       user,
//     });
//   } catch (error) {
//     console.log("Error in buyAndProcessPayment:", error);
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: error.message });
//   }
// };

// // Auto-Renew Functionality ke liye Scheduled Job
// cron.schedule("0 * * * *", async () => {
//   // Yeh job har ghante chalti hai
//   console.log("Running Auto-Renew Job");

//   const usersToRenew = await User.find({
//     autoRenew: true,
//     planExpiryDate: { $lte: new Date() },
//   })
//     .populate("paymentPlanId")
//     .populate("cardDetailsId");

//   for (let user of usersToRenew) {
//     try {
//       const plan = user.paymentPlanId;
//       const card = user.cardDetailsId;

//       // Card details validate karo
//       validateCardDetails({
//         cardNumber: card.cardNumber,
//         expiryDate: card.expiryDate,
//         cvv: card.cvv,
//       });

//       // Payment process karo
//       await processPayment(
//         {
//           cardNumber: card.cardNumber,
//           expiryDate: card.expiryDate,
//           cvv: card.cvv,
//         },
//         plan.actualPrice
//       );

//       // Plan expiry date update karo
//       const currentDate = new Date();
//       const { duration, unit } = parseDuration(plan.duration);
//       let newExpiryDate;
//       if (unit === "month") {
//         newExpiryDate = new Date(
//           currentDate.setMonth(currentDate.getMonth() + duration)
//         );
//       } else if (unit === "minutes") {
//         newExpiryDate = new Date(currentDate.getTime() + duration * 60000);
//       }

//       user.planExpiryDate = newExpiryDate;
//       user.remainingDownloads += plan.bookDownload + plan.audioBookDownload;

//       await user.save();

//       console.log(`Plan auto-renewed for user: ${user.email}`);
//     } catch (err) {
//       console.log(
//         `Auto-renew failed for user: ${user.email}, Error: ${err.message}`
//       );
//       // Agar payment fail ho jaye toh autoRenew ko off kar dete hain
//       user.autoRenew = false;
//       await user.save();
//     }
//   }
// });

// Card Details Validation Function

const validateCardDetails = (cardDetails) => {
  const numberValidation = cardValidator.number(cardDetails.cardNumber);
  // console.log("numberValidation: ", numberValidation);
  const expiryValidation = cardValidator.expirationDate(cardDetails.expiryDate);
  // console.log("expiryValidation: ", expiryValidation);
  const cvvValidation = cardValidator.cvv(cardDetails.cvv);
  // console.log("cvvValidation: ", cvvValidation);

  if (!numberValidation.isValid) {
    throw new Error("Invalid card number.");
  }
  if (!expiryValidation.isValid) {
    throw new Error("Invalid expiry date.");
  }
  if (!cvvValidation.isValid) {
    throw new Error("Invalid CVV.");
  }
};

const getCheckPaymentPlan = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("userId:", userId);

    // Find user by ID and populate paymentPlanId
    const user = await User.findById(userId).populate("paymentPlanId");
    console.log("user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Directly get the paymentPlanId from the user object
    const paymentPlanId = user.paymentPlanId ? user.paymentPlanId._id : null;

    // Directly get cancelMemberShip status from the user object
    const cancelMemberShip = user.cancelMemberShip;

    // Return paymentPlanId and cancelMemberShip status
    res.status(200).json({ paymentPlanId, cancelMemberShip });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Simulated Payment Processing Function
const processPayment = async (cardDetails, amount) => {
  // Yeh simulated function hai. Real-world mein yahan payment gateway integrate hoga.
  // Abhi hum assume karte hain ke card mein hamesha sufficient funds hain.
  // Agar funds insufficient honge toh error throw karenge.

  // For simulation, let's assume cards ending with '0000' have insufficient funds
  if (cardDetails.cardNumber.endsWith("0000")) {
    throw new Error("Insufficient funds in the card.");
  }

  // Payment successful
  return true;
};

// Promo Code Discount Calculation Function
const applyPromoCode = async (promoCode, finalPrice) => {
  if (promoCode) {
    const promo = await CouponCodeDiscount.findOne({
      couponCodeName: promoCode,
    });
    console.log("promo code name: ", promo);
    if (promo && new Date() <= promo.endDate) {
      const discountPercent = parseFloat(promo.discount.replace("%", ""));
      console.log("discountPercent: ", discountPercent);
      finalPrice -= finalPrice * (discountPercent / 100);
      console.log("Discount applied for final price: ", finalPrice);
    } else {
      throw new Error("Invalid or expired promo code.");
    }
  }
  return finalPrice;
};

// Function to Calculate Expiry Date
// const calculateExpiryDate = (currentDate, duration, unit) => {
//   let expiryDate;
//   if (unit === "month") {
//     expiryDate = new Date(
//       currentDate.setMonth(currentDate.getMonth() + duration)
//     );

//   } else if (unit === "minutes") {
//     expiryDate = new Date(currentDate.getTime() + duration * 60000);

//   } else if (unit === "year") {
//     expiryDate = new Date(currentDate.getYear() + duration);
//   }
//   return expiryDate;
// };

// const buyAndProcessPayment = async (req, res) => {
//   try {
//     const { userId, paymentPlanId, cardDetails, promoCode } = req.body;
//     // console.log("userId, paymentPlanId, cardDetails, promoCode :", req.body);

//     // User aur Plan ko find karo
//     const user = await User.findById(userId).populate("paymentPlanId");
//     const newPlan = await paymentPlanModel.findById(paymentPlanId);

//     console.log("login user :", user);
//     console.log("newPlan :", newPlan);

//     if (!user || !newPlan)
//       return res.status(404).json({ message: "User or Plan not found" });

//     // Duration parse karo
//     const { duration, unit } = parseDuration(newPlan.duration);
//     console.log("duration, unit: ", newPlan.duration);

//     // Promo code apply karo agar diya gaya hai
//     let finalPrice = parseFloat(newPlan.actualPrice);
//     console.log("finalPrice: ", finalPrice);
//     if (promoCode) {
//       finalPrice = await applyPromoCode(promoCode, finalPrice);
//     }

//     // Card details validate karo
//     // validateCardDetails(cardDetails);

//     // Payment process karo
//     await processPayment(cardDetails, finalPrice);

//     // Agar user ke pass purane card details hain, to unko delete karte hain.
//     if (user.cardDetailsId) {
//       await CardDetails.findByIdAndDelete(user.cardDetailsId);
//     }

//     // Card details save karo
//     const card = new CardDetails({
//       cardNumber: cardDetails.cardNumber,
//       nameOfCard: cardDetails.nameOfCard,
//       expiryDate: cardDetails.expiryDate,
//       cvv: cardDetails.cvv,
//       userId: user._id,
//       plan: newPlan.paymentPlan,
//     });
//     await card.save();

//     // Agar user ka pehla plan hai to uske download counts new plan mein add karo:
//     if (user.paymentPlanId) {
//       const previousPlan = user.paymentPlanId;
//       console.log("previousPlan:", previousPlan);
//       // Update new plan's downloads by adding previous plan's downloads
//       newPlan.bookDownload += previousPlan.bookDownload || 0;
//       newPlan.audioBookDownload += previousPlan.audioBookDownload || 0;
//       // await paymentPlanModel.findByIdAndUpdate(previousPlan._id);

//       // Instead of deleting the plan, just update the plan
//       await paymentPlanModel.findByIdAndUpdate(previousPlan._id, {
//         bookDownload: newPlan.bookDownload,
//         audioBookDownload: newPlan.audioBookDownload,
//       });
//       console.log(
//         "Updated previous plan with new download counts",
//         previousPlan
//       );
//     }
//     const currentDate = new Date();
//     const expiryDate = calculateExpiryDate(currentDate, duration, unit);
//     console.log("expiryDate: ", expiryDate);
//     const remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;
//     console.log("remainingDownloads: ", remainingDownloads);

//     user.set({
//       planExpiryDate: expiryDate,
//       paymentPlanId,
//       cardDetailsId: card._id,
//       downloadToken: crypto.randomBytes(50).toString("hex"),
//       remainingDownloads,
//       bookDownload: newPlan.bookDownload,
//       audioBookDownload: newPlan.audioBookDownload,
//       autoRenew: true,
//       downloadsThisMonth: 0,
//       currentMonth: new Date().getMonth() + 1,
//     });

//     // // User ke remaining downloads update karo
//     // // user.remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;
//     // user.planExpiryDate = expiryDate;
//     // user.paymentPlanId = paymentPlanId;
//     // user.cardDetailsId = card._id;
//     // user.downloadToken = crypto.randomBytes(50).toString("hex");
//     // user.autoRenew = true; // Assume karo user ne auto-renew on rakha hai
//     // bookDownload= newPlan.bookDownload,
//     // audioBookDownload= newPlan.audioBookDownload,

//     // const currentDate = new Date();
//     // // Plan expiry date calculate karo
//     // const expiryDate = calculateExpiryDate(currentDate, duration, unit);
//     // console.log("expiryDate :", expiryDate);
//     // // User ke remaining downloads update karo
//     // // user.remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;
//     // const { bookDownload, audioBookDownload } = newPlan;
//     // console.log("bookDownload, audioBookDownload :", newPlan);

//     // Updated user ko save karo
//     await user.save();
//     await newPlan.save();

//     res.status(200).json({
//       message: "New plan purchased and payment processed successfully",
//       user,
//     });
//   } catch (error) {
//     console.log("Error in buyAndProcessPayment:", error);
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: error.message });
//   }
// }

const calculateExpiryDate = (currentDate, duration, unit) => {
  // Naya Date object banayein taake original date modify na ho
  let expiryDate = new Date(currentDate);

  if (unit === "month") {
    // Months add karein
    expiryDate.setMonth(expiryDate.getMonth() + duration);
  } else if (unit === "minutes") {
    // Minutes add karein
    expiryDate.setTime(expiryDate.getTime() + duration * 60000);
  } else if (unit === "year") {
    // Years add karein
    expiryDate.setFullYear(expiryDate.getFullYear() + duration);
  }

  return expiryDate;
};

const downloadBook = async (req, res) => {
  try {
    const token = req.header("dowloadToken");
    console.log("download token: ", token);
    const { downloadType } = req.body; // Array of download types like ['bookDownload', 'audioBookDownload']
    console.log("downloadType: ", req.body);

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

    const currentMonth = new Date().getMonth() + 1;
    console.log("currentMonth: ", currentMonth);
    if (user.currentMonth !== currentMonth) {
      user.downloadsThisMonth = 0;
      user.currentMonth = currentMonth;
      console.log("currentMonth: ", currentMonth);
    }

    if (user.downloadsThisMonth >= 10) {
      return res
        .status(403)
        .json({ message: "Monthly download limit reached" });
    }

    let totalDownloadsToDeduct = 0;
    let validDownloads = true;

    for (const type of downloadType) {
      if (type === "bookDownload" && user.bookDownload > 0) {
        totalDownloadsToDeduct += 1;
        user.bookDownload -= 1;
      } else if (type === "audioBookDownload" && user.audioBookDownload > 0) {
        totalDownloadsToDeduct += 1;
        user.audioBookDownload -= 1;
      } else {
        validDownloads = false;
        break;
      }
    }

    if (!validDownloads) {
      return res
        .status(403)
        .json({ message: "All downloads have been used or type invalid" });
    }

    // let totalDownloadsToDeduct = 0;
    // let validDownloads = true;

    // for (const type of downloadType) {
    //   if (type === "bookDownload" && user.paymentPlanId.bookDownload > 0) {
    //     totalDownloadsToDeduct += 1;
    //   } else if (
    //     type === "audioBookDownload" &&
    //     user.paymentPlanId.audioBookDownload > 0
    //   ) {
    //     totalDownloadsToDeduct += 1;
    //   } else {
    //     validDownloads = false;
    //     break;
    //   }
    // }

    // if (!validDownloads) {
    //   return res
    //     .status(403)
    //     .json({ message: "All downloads have been used or type invalid" });
    // }
    // if (user.remainingDownloads <= 0)
    //   return res.status(403).json({ message: "Please upgrade your plan" });

    user.remainingDownloads -= totalDownloadsToDeduct;
    user.downloadsThisMonth += totalDownloadsToDeduct;

    await user.paymentPlanId.save();
    await user.save();

    // // Check if a new plan needs to be applied
    // const currentDate = new Date();
    // const lastPlanDate = new Date(user.updatedAt);
    // const planDuration = user.paymentPlanId.duration; // Assuming duration is in months
    // const nextRenewalDate = new Date(
    //   lastPlanDate.setMonth(lastPlanDate.getMonth() + planDuration)
    // );

    // if (
    //   user.remainingDownloads <= 0 &&
    //   user.cardDetailsId &&
    //   currentDate >= nextRenewalDate
    // ) {
    //   // Reset to new plan downloads
    //   user.remainingDownloads =
    //     user.paymentPlanId.bookDownload +
    //     user.paymentPlanId.audioBookDownload;
    //   user.downloadToken = crypto.randomBytes(50).toString("hex");
    //   user.updatedAt = new Date();
    //   await user.save();
    // }

    // // Fetch all books and audio books data
    // const books = await BookModel.find();
    // const audioBooks = await AudioBookModel.find();

    res.status(200).json({
      message: "Download(s) processed successfully",
      // remainingDownloads: user.remainingDownloads,
      // bookDownload: user.paymentPlanId.bookDownload,
      // audioBookDownload: user.paymentPlanId.audioBookDownload,
      remainingDownloads: user.remainingDownloads,
      bookDownload: user.bookDownload,
      audioBookDownload: user.audioBookDownload,
      // books: user.paymentPlanId.bookDownload > 0 ? books : [],
      // audioBooks: user.paymentPlanId.audioBookDownload > 0 ? audioBooks : [],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing download", error: error.message });
  }
};

const buyAndProcessPayment = async (req, res) => {
  try {
    const { userId, paymentPlanId, cardDetails, promoCode } = req.body;

    // User aur Plan ko find karo
    const user = await User.findById(userId).populate("paymentPlanId");
    const newPlan = await paymentPlanModel.findById(paymentPlanId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!newPlan) {
      return res.status(404).json({ message: "New plan not found" });
    }

    // Promo code apply karo agar diya gaya hai
    let finalPrice = parseFloat(newPlan.actualPrice);
    if (promoCode) {
      finalPrice = await applyPromoCode(promoCode, finalPrice);
    }

    // Payment process karo
    await processPayment(cardDetails, finalPrice);

    // Purane card details delete karo agar wo exist karti hain
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

    // Purane plan ke downloads ko update karo agar wo abhi tak valid hai aur remaining downloads hain
    let updatedBookDownloads = newPlan.bookDownload;
    let updatedAudioBookDownloads = newPlan.audioBookDownload;

    // Pehle plan ke downloads ko update karo agar wo abhi tak valid hai aur remaining downloads hain
    if (user.paymentPlanId && user.planExpiryDate > new Date()) {
      const previousPlan = user.paymentPlanId;
      console.log("previousPlan: ", previousPlan);

      // Pehle plan ke used downloads calculate karo
      const usedBookDownloads =
        previousPlan.originalBookDownload - previousPlan.bookDownload;
      const usedAudioBookDownloads =
        previousPlan.originalAudioBookDownload - previousPlan.audioBookDownload;
      console.log("usedBookDownloads: ", usedBookDownloads);
      console.log("usedAudioBookDownloads: ", usedAudioBookDownloads);

      // Remaining downloads ko new plan mein merge karo
      updatedBookDownloads += previousPlan.bookDownload;
      updatedAudioBookDownloads += previousPlan.audioBookDownload;

      // // Pehle plan ke used downloads calculate karo
      // const usedBookDownloads =
      //   previousPlan.originalBookDownload - previousPlan.bookDownload;
      // const usedAudioBookDownloads =
      //   previousPlan.originalAudioBookDownload - previousPlan.audioBookDownload;

      // // Remaining downloads ko new plan mein merge karo
      // const remainingBookDownloads = previousPlan.bookDownload;
      // const remainingAudioBookDownloads = previousPlan.audioBookDownload;

      // updatedBookDownloads += remainingBookDownloads;
      // updatedAudioBookDownloads += remainingAudioBookDownloads;


      // Purane plan ke downloads update karo
      await paymentPlanModel.findByIdAndUpdate(previousPlan._id, {
        // bookDownload: newPlan.bookDownload,
        // audioBookDownload: newPlan.audioBookDownload,
        bookDownload: 0,
        audioBookDownload: 0,
      });

      // Auto-renew ko false kar do agar plan delete ho chuka hai
      user.autoRenew = false;
    }
  

    //  Duration parse karo
    const { duration, unit } = parseDuration(newPlan.duration);
    console.log("duration, unit: ", newPlan.duration);

    const currentDate = new Date();
    const expiryDate = calculateExpiryDate(currentDate, duration, unit);
    console.log("expiryDate: ", expiryDate);
    console.log("New Plan:", newPlan);
    console.log("Duration:", newPlan.duration);
    console.log("Unit:", newPlan.unit);

    console.log("expiryDate: ", expiryDate);

    // const remainingDownloads = newPlan.bookDownload + newPlan.audioBookDownload;
    // const remainingDownloads = updatedBookDownloads + updatedAudioBookDownloads;
    // console.log("remainingDownloads: ", remainingDownloads);

    // User ki information update karo
    user.set({
      planExpiryDate: expiryDate,
      paymentPlanId: newPlan._id,
      cardDetailsId: card._id,
      downloadToken: crypto.randomBytes(50).toString("hex"),
      remainingDownloads: updatedBookDownloads + updatedAudioBookDownloads,
      bookDownload: updatedBookDownloads,
      audioBookDownload: updatedAudioBookDownloads,
      autoRenew: true,
      downloadsThisMonth: 0,
      currentMonth: new Date().getMonth() + 1,
      cancelMemberShip: false, // This line sets the 'canceled' status to false
    });

    // User aur Plan ko save karo
    await user.save();
    await newPlan.save();

    res.status(200).json({
      message: "New plan purchased and payment processed successfully",
      user,
    });
  } catch (error) {
    console.error("Error in buyAndProcessPayment:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};



module.exports = {
  createPaymentPlan,
  getAllPaymentPlans,
  updatePaymentPlan,
  deletePaymentPlan,
  getCheckPaymentPlan,
  buyAndProcessPayment,
  downloadBook,
  parseDuration,
};
