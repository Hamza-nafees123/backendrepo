const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel.js");
const CardDetails = require("../models/Card-Details-Model.js");
const paymentPlanModel = require("../models/Payment-Plan-Model.js");

const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

exports.authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log("token :", token);

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified Token:", verifyToken);

    // Find user with matching token
    const user = await UserModel.findOne({ _id: verifyToken.userId });
    console.log("verifyToken user:", user);

    if (!user) {
      console.log("User not found with this token");

      throw new Error("User not found");
    }

    // req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized token" });
  }
};

exports.checkUserPlanStatus = async (req, res, next) => {
  try {
    // console.log("req.user: ", req.user); // Add this line

    const id = req?.user?.userId; // Assuming user ID is available in the request
    console.log("id: ", id);

    const user = await UserModel.findById(id).populate("paymentPlanId");
    console.log("middle ware user: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const planPurchased = user.paymentPlanId ? true : false;
    console.log("planPurchased: ", planPurchased);

    req.planPurchased = planPurchased;
    next();
  } catch (error) {
    console.log("Error in checkUserPlanStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Jab ye middleware chal raha hai aur user ka plan expire ho chuka hota hai,
// to ye user ke paymentPlanId aur cardDetailsId ko null set kar deta hai.
//  Iska matlab hai ke jab aapka auto-renew job chal raha hai, \
// to wo is user ko consider nahi karega kyunki paymentPlanId aur cardDetailsId null ho chuke hain.

// Solution:
// Aapko apne middleware me ye logic add karna hoga ke agar autoRenew: true hai,
// to user ke details reset na ho. Sirf us case me reset karo jab autoRenew: false ho.

// exports.checkPlanExpiry = async (req, res, next) => {
//   console.log("req.user:", req.user);
//   const user = await UserModel.findById(req.user._id).populate("paymentPlanId"); // Populate to get payment plan details
//   console.log("check-Plan-Expiry-User:", user);

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   if (new Date() > user.planExpiryDate) {
//     if (!user.autoRenew) {
//       // Update User Details
//       // user.remainingDownloads = 0;
//       // user.bookDownload = 0;
//       // user.audioBookDownload = 0;
//       // user.planExpiryDate = null; // Optional: Set to null or another value if needed
//       // user.paymentPlanId = null; // Remove reference to payment plan
//       // user.cardDetailsId = null; // Remove reference to payment plan
//       // user.downloadsThisMonth = 0; // Remove reference to payment plan
//       // user.downloadToken = null; // Remove reference to payment plan
//       await user.save();
//       console.log("User details reset due to plan expiry.");

//       // // Delete Payment Plan if it exists
//       // if (user.paymentPlanId) {
//       //   const paymentPlan = await paymentPlanModel.findById(user.paymentPlanId);
//       //   console.log("checkPlanExpiry paymentPlan:", paymentPlan);

//       //   if (paymentPlan) {
//       //     await paymentPlanModel.findByIdAndDelete(user.paymentPlanId);
//       //     console.log("Payment plan deleted:", paymentPlan);
//       //   }
//       // }
//       // // Delete Payment Plan if it exists
//       // if (user.cardDetailsId) {
//       //   const cardDetails = await CardDetails.findById(user.cardDetailsId);
//       //   console.log("checkPlanExpiry paymentPlan:", paymentPlan);

//       //   if (paymentPlan) {
//       //     await CardDetails.findByIdAndDelete(user.paymentPlanId);
//       //     console.log("Payment plan deleted:", paymentPlan);
//       //   }
//       // }
//     }
//   }
//   next();
// };


// Middleware to Check Plan Expiry
exports.checkPlanExpiry = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentDate = new Date();
    if (user.planExpiryDate <= currentDate) {
      return res.status(403).json({ message: "This plan is not exist, please buy another plan" });
    }

    next();
  } catch (error) {
    console.error("Error in checkPlanExpiry:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};




// module.exports = { authMiddleware, checkUserPlanStatus };

// const downloadMiddleware = async (req, res, next) => {
//     const { downloadToken } = req.headers;
//     console.log("downloadToken :", downloadToken);

//     if (!downloadToken) {
//         return res.status(401).json({ message: "Download token zaroori hai" });
//     }

//     try {
//         const decoded = jwt.verify(downloadToken, JWT_SECRET);
//         console.log("decoded :", decoded);

//         // Download logic yahan chalega
//     } catch (error) {
//         return res.status(401).json({ message: "Token invalid ya expired hai" });
//     }
// }

// module.exports = { authMiddleware, downloadMiddleware };

// const jwt = require('jsonwebtoken');
// // const Admin = require('../models/AdminModel');
// const User = require('../models/UserModel.js');
// const dotenv = require("dotenv");

// // Load environment variables
// dotenv.config();

// const authMiddleware = async (req, res, next) => {
//     const token = req.header("Authorization").replace("Bearer ", ""); // Ensure Bearer is removed;
//     // console.log("req.cookies:", req.cookies);

//     if (!token) {
//         return res.status(401).json({ message: "Token not provided" });
//     }

//     try {
//         const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
//         // console.log("verifyToken:", verifyToken);
//         const user = await User.findOne({ _id: verifyToken._id, 'tokens.token': token });
//         console.log("user:", user);

//         if (!user) {
//             throw new Error("User not found");
//         }

//         req.user = user;

//         next();
//         // req.user = verifyToken.userId;

//     } catch (error) {
//         console.log("Token verification error:", error);
//         return res.status(401).json({ message: "Unauthorized token" });
//     }
// };

// module.exports = authMiddleware;
