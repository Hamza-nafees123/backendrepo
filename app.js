require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
// Database connection
const connectDB = require("./config/db");

// Import models
const User = require("./models/UserModel.js");
const PaymentPlan = require("./models/Payment-Plan-Model.js");
const CouponCodeDiscount = require("./models/Promo-code-Model.js");
// const {calculateExpiryDate} = require("./controller/Payment-plan-controller.js/");

// Import routes
const userRoutes = require("./routes/user-routes");
const adminRoutes = require("./routes/admin-routes");
const bookRoutes = require("./routes/book-routes");
const audioRoutes = require("./routes/audio-category.route");
const audioBookRoutes = require("./routes/audio-book-route");
const bannerRoutes = require("./routes/banner.route");
const paymentPlanRoutes = require("./routes/payment-plan-routes");
const promoCodeRoutes = require("./routes/promo-code-routes");
const sabAdminRoutes = require("./routes/sab-admin-route");
const recentlyReadBookRoutes = require("./routes/recently-read-route");
const contactRoutes = require("./routes/contact-route.js");
const newlyEditRoutes = require("./routes/newly-edit-routes.js");
const recommendedRoutes = require("./routes/recommended-routes.js");
const paymentRoutes = require("./routes/payment-routes.js");
const promoRoutes = require("./routes/payment-routes.js"); // Promo routes ko include kar rahe hain
const faqRoutes = require("./routes/faq-category-routes.js"); // Promo routes ko include kar rahe hain
const faqQuestionRoutes = require("./routes/faq-question-routes.js"); // Promo routes ko include kar rahe hain
const notification = require("./routes/notification-routes.js"); // Promo routes ko include kar rahe hain
const favourite = require("./routes/favourite-routes.js"); // Promo routes ko include kar rahe hain
const refundContactFromRoutes = require("./routes/refund-contact-form-routes.js");
const homePageSelectedRoutes = require("./routes/home-page-selected-book-routes.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connect to the database
connectDB();

// Define routes
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/books", bookRoutes);
app.use("/api", audioRoutes);
app.use("/api", audioBookRoutes);
app.use("/api", bannerRoutes);
app.use("/api", paymentPlanRoutes);
app.use("/api", promoCodeRoutes);
app.use("/api/sab-admin", sabAdminRoutes);
app.use("/api", recentlyReadBookRoutes);
app.use("/api", newlyEditRoutes);
app.use("/api", contactRoutes);
app.use("/api", recommendedRoutes);
app.use("/api/payments", paymentRoutes); // Payment routes ko set kar rahe hain
app.use("/api/promos", promoRoutes); // Promo routes ko set kar rahe hain
app.use("/api", faqRoutes); // Promo routes ko set kar rahe hain
app.use("/api", faqQuestionRoutes); // Promo routes ko set kar rahe hain
app.use("/api", notification); // Promo routes ko set kar rahe hain
app.use("/api", favourite); // Promo routes ko set kar rahe hain
app.use("/api", refundContactFromRoutes); // Promo routes ko set kar rahe hain
app.use("/api", homePageSelectedRoutes); // Promo routes ko set kar rahe hain

// const parseDuration = (durationStr) => {
//   if (typeof durationStr !== "string") {
//     throw new Error(
//       'Invalid duration format. The duration must be a string like "1 month" or "30 minutes".'
//     );
//   }

//   const [value, unit] = durationStr.toLowerCase().split(" ");
//   const duration = parseInt(value, 10);

//   if (isNaN(duration) || (unit !== "month" && unit !== "minutes")) {
//     throw new Error('Invalid duration format. Use "X month" or "Y minutes".');
//   }

//   return { duration, unit };
// };

// const calculateExpiryDate = (currentDate, duration, unit) => {
//   // Naya Date object banayein taake original date modify na ho
//   let expiryDate = new Date(currentDate);

//   if (unit === "month") {
//     // Months add karein
//     expiryDate.setMonth(expiryDate.getMonth() + duration);
//   } else if (unit === "minutes") {
//     // Minutes add karein
//     expiryDate.setTime(expiryDate.getTime() + duration * 60000);
//   } else if (unit === "year") {
//     // Years add karein
//     expiryDate.setFullYear(expiryDate.getFullYear() + duration);
//   }

//   return expiryDate;
// };

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

// // // Auto-Renew Functionality ke liye Scheduled Job
// cron.schedule("*/5 * * * *", async () => {
//   // Yeh job har ghante chalti hai
//   console.log("Running Auto-Renew Job");

//   const usersToRenew = await User.find({
//     autoRenew: true,
//     planExpiryDate: { $lte: new Date() },
//   })
//     .populate("paymentPlanId")
//     .populate("cardDetailsId");
//   console.log("usersToRenew: ", usersToRenew);

//   for (let user of usersToRenew) {
//     try {
//       const plan = user.paymentPlanId;
//       console.log("auto renew plan: ", plan);
//       const card = user.cardDetailsId;
//       console.log("auto renew card: ", card);

//       if (!plan || !card) {
//         console.log(
//           `Skipping user: ${user.email}. Plan or card details missing.`
//         );
//         continue;
//       }

//       // Card details validate karo
//       // validateCardDetails({
//       //   cardNumber: card.cardNumber,
//       //   expiryDate: card.expiryDate,
//       //   cvv: card.cvv,
//       // });

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
//       console.log("duration, unit: ", plan.duration);
//       const newExpiryDate = calculateExpiryDate(currentDate, duration, unit);
//       console.log("newExpiryDate: ", newExpiryDate);
//       user.planExpiryDate = newExpiryDate;

//       // Optionally update downloads if required
//       // user.remainingDownloads += plan.bookDownload + plan.audioBookDownload;

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

// Scheduled task to remove expired promo codes
//Agar tumhara goal hai ke expired promo codes ko har ghante automatically remove karna hai, to ye scheduled task use karna bilkul theek hai.
// Iska use karne se tumhare database se purane aur expire ho chuke promo codes regularly clean hote rahenge.

// Scheduler setup for checking expired plans

cron.schedule("*/5 * * * *", async () => {
  console.log("Running in cancel memeber ship cron schedule");
  // Runs every day at midnight
  try {
    const expiredUsers = await User.find({
      cancelMemberShip: true,
      planExpiryDate: { $lte: new Date() },
    }).populate("paymentPlanId")
      .populate("cardDetailsId");
    console.log("cancel member ship expiredUsers: ", expiredUsers);

    if (expiredUsers.length > 0) {
      expiredUsers.forEach(async (user) => {
        user.paymentPlanId = null;
        user.cardDetailsId = null;
        user.remainingDownloads = 0;
        user.bookDownload = 0;
        user.audioBookDownload = 0;
        user.downloadsThisMonth = 0;
        // user.autoRenew = false;
        await user.save();
      });
      console.log(`${expiredUsers.length} user(s) plan reset due to expiry.`);
    }
  } catch (error) {
    console.error("Error checking expired plans:", error.message);
  }
});

cron.schedule("0 * * * *", async () => {
  // Har ghante chalti hai
  try {
    await CouponCodeDiscount.removeExpired();
    console.log("Expired promo codes removed successfully");
  } catch (error) {
    console.error("Error removing expired promo codes:", error);
  }
});

// // Cron job to handle plan expiry and auto-renewal
// cron.schedule("0 0 * * *", async () => {
//   try {
//     const currentDate = new Date();
//     const users = await User.find({ planExpiryDate: { $lte: currentDate } });

//     for (const user of users) {
//       if (user.autoRenew && user.cardDetailsId) {
//         const newPlan = await PaymentPlan.findById(user.paymentPlanId);

//         if (newPlan) {
//           const newPlanBookDownloads = newPlan.bookDownload || 0;
//           const newPlanAudioBookDownloads = newPlan.audioBookDownload || 0;

//           user.remainingDownloads =
//             newPlanBookDownloads + newPlanAudioBookDownloads;

//           // Reset plan expiry date
//           const planDurationInMonths = newPlan.duration; // assuming duration is in months
//           const expiryDate = new Date();
//           expiryDate.setMonth(expiryDate.getMonth() + planDurationInMonths);
//           user.planExpiryDate = expiryDate;

//           user.downloadToken = crypto.randomBytes(50).toString("hex");

//           await user.save();
//         }
//       } else {
//         // If auto-renew is not enabled, reset downloads
//         user.remainingDownloads = 0;
//         user.paymentPlanId = null;
//         await user.save();
//       }
//     }
//   } catch (error) {
//     console.log("Error in auto-renewal job:", error);
//   }
// });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
