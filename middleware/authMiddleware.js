const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel.js");
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
