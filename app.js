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

// Cron job to handle plan expiry and auto-renewal
cron.schedule("0 0 * * *", async () => {
  try {
    const currentDate = new Date();
    const users = await User.find({ planExpiryDate: { $lte: currentDate } });

    for (const user of users) {
      if (user.autoRenew && user.cardDetailsId) {
        const newPlan = await PaymentPlan.findById(user.paymentPlanId);
        
        if (newPlan) {
          const newPlanBookDownloads = newPlan.bookDownload || 0;
          const newPlanAudioBookDownloads = newPlan.audioBookDownload || 0;

          user.remainingDownloads =
            newPlanBookDownloads + newPlanAudioBookDownloads;

          // Reset plan expiry date
          const planDurationInMonths = newPlan.duration; // assuming duration is in months
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + planDurationInMonths);
          user.planExpiryDate = expiryDate;

          user.downloadToken = crypto.randomBytes(50).toString("hex");

          await user.save();
        }
      } else {
        // If auto-renew is not enabled, reset downloads
        user.remainingDownloads = 0;
        user.paymentPlanId = null;
        await user.save();
      }
    }
  } catch (error) {
    console.log("Error in auto-renewal job:", error);
  }
});

// Scheduled task to remove expired promo codes
//Agar tumhara goal hai ke expired promo codes ko har ghante automatically remove karna hai, to ye scheduled task use karna bilkul theek hai.
// Iska use karne se tumhare database se purane aur expire ho chuke promo codes regularly clean hote rahenge.
cron.schedule("0 * * * *", async () => {
  // Har ghante chalti hai
  try {
    await CouponCodeDiscount.removeExpired();
    console.log("Expired promo codes removed successfully");
  } catch (error) {
    console.error("Error removing expired promo codes:", error);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');

// const userRoutes = require('./routes/user-routes');
// const adminRoutes = require('./routes/admin-routes.js');
// const bookRoutes = require('./routes/book-routes');
// const audioRoutes = require('./routes/audio-category.route');
// const audioBookRoutes = require('./routes/audio-book-route.js');
// const bannerRoutes = require('./routes/banner.route.js');
// const paymentPlanRoutes = require('./routes/payment-plan-routes.js');
// const promoCodeRoutes = require('./routes/promo-code-routes.js');
// const sabAminROutes = require('./routes/sab-admin-route.js');
// const connectDB  = require('./config/db.js');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(cookieParser());
// // const path = require('path');
// connectDB();

// // Routes
// app.use('/api/', userRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/books', bookRoutes);
// app.use('/api', audioRoutes);
// app.use('/api', audioBookRoutes);
// app.use('/api', bannerRoutes);
// app.use('/api', paymentPlanRoutes);
// app.use('/api', promoCodeRoutes);
// app.use('/api/sab-admin', sabAminROutes);

// // const connectDB = async () => {
// //   try {
// //     await mongoose.connect(process.env.MONGODB_URI);
// //     console.log('Connected to MongoDB');
// //   } catch (err) {
// //     console.error(err.message);
// //     process.exit(1); // Exit process with failure
// //   }
// // };

// // app.use('/fileUploads/images', express.static(path.join(__dirname, 'fileUploads', 'images')));
// // app.use('/fileUploads/pdfs', express.static(path.join(__dirname, 'fileUploads', 'pdfs')));
// // app.use('/', express.static(path.join(__dirname, 'fileUploads')));
// // app.use('/images', express.static(path.join(__dirname, 'fileUploads', 'images')));
// // app.use('/pdfs', express.static(path.join(__dirname, 'fileUploads', 'pdfs')));
// // Serve static assets (only needed if you have a frontend build to serve)
// // Example: Serve React static files from 'client/build'
// // app.use(express.static(path.join(__dirname, 'client/build')));
// // app.get('*', (req, res) => {
// //   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// // });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
