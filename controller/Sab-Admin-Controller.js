const SabAdmin = require("../models/Sab-Admin-Model.js");
const User = require("../models/UserModel.js");
const PaymentPlan = require("../models/Payment-Plan-Model.js");
const CardDetails = require("../models/Card-Details-Model.js");
const refundContactFrom = require("../models/Refund-Contact-Form-Model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Book = require("../models/BookModel.js");
const Category = require("../models/CategoryModel.js");
const homePageSelectedBookSchema = require("../models/Home-Page-Selected-Model.js");

const registerSabAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Required Parameter missing" });
    }

    // Check if user already exists
    let existingUser = await SabAdmin.findOne({ name });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Sab Admin already exists with this name" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user instance
    const newUser = new SabAdmin({
      name,
      password: hashedPassword,
    });
    console.log("newUser :", newUser);

    // Save user to database
    await newUser.save();
    // console.log("newUser: ", newUser);

    // Send success response with token
    res.status(201).json({
      message: "Sab admin registered successfully",
      newUser,
    });
  } catch (error) {
    // Handle errors
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

const loginSabAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;

    // Find user by email
    const user = await SabAdmin.findOne({ name });
    if (!user) {
      return res.status(404).json({ message: "Sab admin not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const loginToken = jwt.sign({ userId: user._id }, "Hassan_Nadeem", {
      expiresIn: "5h",
    });
    // console.log("loginToken: ", loginToken);

    // Send success response with loginToken
    res.status(200).json({
      message: "Sab admin logged in successfully",
      user,
      loginToken,
    });
  } catch (error) {
    // Handle errors
    console.error("Error logging in user:", error);
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

// const updatePassword = async (req, res, next) => {
//     const { currentPassword, newPassword } = req.body;

//     // Check if both currentPassword and newPassword are provided
//     if (!currentPassword || !newPassword) {
//         return res.status(400).json({ message: "Current password and new password are required" });
//     }

//     const adminId = req.params.id;

//     try {
//         // Find the user by ID
//         const user = await SabAdmin.findById(adminId);

//         // If user is not found, return a 404 error
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Compare the current password with the user's stored password
//         const isMatch = await bcrypt.compare(currentPassword, user.password);

//         // If the passwords do not match, return a 400 error
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Current password is incorrect' });
//         }

//         // If the current password is correct, proceed to hash the new password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword, salt);

//         // Update the user's password with the new hashed password
//         user.password = hashedPassword;
//         await user.save();

//         // Respond with a success message
//         res.status(200).json({ message: 'Password updated successfully' });

//     } catch (error) {
//         // Log the error and respond with a 500 error
//         console.error("Error updating password: ", error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

const getAllSabAdmins = async (req, res, next) => {
  try {
    const getAllAdmins = await SabAdmin.find();
    console.log("getAllAdmins: ", getAllAdmins);

    if (getAllAdmins.length === 0) {
      return res.status(404).json({ message: "Sab admin not found" });
    }
    res
      .status(200)
      .json({ message: "Get all Sab admin successfully", getAllAdmins });
  } catch (error) {
    console.log("error: ", error);
  }
};

const singleDeleteSabAdminWithId = async (req, res, next) => {
  try {
    const deletedsabAdminId = req.params.id;
    console.log("deletedsabAdminId: ", deletedsabAdminId);

    const deleteSabAdmin = await SabAdmin.findByIdAndDelete(deletedsabAdminId);
    console.log("deleteSabAdmin: ", deleteSabAdmin);

    if (!deleteSabAdmin) {
      return res.status(404).json({
        message: `Cannot delete sab admin with id=${deletedsabAdminId}. Maybe sab admin was not found!`,
      });
    }

    res
      .status(200)
      .json({ message: "Sab admin deleted successfully", deleteSabAdmin });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      message: `Could not delete payment plan with id=${deletedplanId}`,
      error: err.message,
    });
  }
};

const processRefund = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("User ID: ", userId);

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found: ", user);

    // Log current values
    console.log("Current paymentPlanId: ", user.paymentPlanId);
    console.log("Current cardDetailsId: ", user.cardDetailsId);

    // Check if cardDetailsId is valid before deleting

    // if (user.cardDetailsId) {
    //   const cardDetails = await CardDetails.findById(user.cardDetailsId);
    //   if (cardDetails) {
    //     await CardDetails.deleteOne({ _id: user.cardDetailsId });
    //     console.log("Card details removed");
    //   } else {
    //     console.log("Card details not found");
    //   }
    // }

    // // Check if paymentPlanId is valid before deleting
    // if (user.paymentPlanId) {
    //   const paymentPlan = await PaymentPlan.findById(user.paymentPlanId);
    //   if (paymentPlan) {
    //     await PaymentPlan.deleteOne({ _id: user.paymentPlanId });
    //     console.log("Payment plan removed");
    //   } else {
    //     console.log("Payment plan not found");
    //   }
    // }

    // Update user document
    user.paymentPlanId = null;
    user.cardDetailsId = null;
    user.remainingDownloads = null;
    user.cancelMemberShip = true; // Set cancelMemberShip to true

    // Save the updated user
    const updatedUser = await user.save();
    console.log("Updated user: ", updatedUser);

    res
      .status(200)
      .json({ message: "Refund processed successfully", user: updatedUser });
  } catch (error) {
    console.error("Error processing refund: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsersRefundDetails = async (req, res) => {
  try {
    // Saare users ko find karo
    const users = await User.find({ cancelMemberShip: true });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found with processed refunds" });
    }

    // Ab saare users ka data return karo
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users' refund details: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const homePageSelectedRomance = async (req, res, next) => {
  try {
      // Extract required fields from request body
      const { bookId, categoryId } = req.body;
      console.log("bookId :", bookId);

      // Check if bookId is provided
      if (!bookId || !categoryId) {
          return res.status(400).json({
              success: false,
              message: 'book and category id is required.'
          });
      }


      // Fetch primary category details
      const bookCategory = await Book.findById(bookId);
      if (!bookCategory) {
          return res.status(404).json({
              success: false,
              message: 'Book not found.'
          });
      }
      console.log("bookCategory :", bookCategory);

      const category = await Category.findById(categoryId);
      if (!category) {
          return res.status(404).json({
              success: false,
              message: 'Category not found.'
          });
      }
      console.log("category :", category);




      // // Check for required fields
      // if (!bookTitle || !authorName || !primaryCategory || !shortDescription || !longDescription || !imageUpload.url || !audioUpload.url) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "All fields are required"
      //     });
      // }


      // Create a new Banner instance
      const createBanner = await homePageSelectedBookSchema.create({
          bookId: bookCategory._id, // Assign bookId as the _id of BookCategory
          categoryId: category._id, // Assign bookId as the _id of BookCategory
      });
      console.log("createBanner: ", createBanner);
      // // Save the new banner to the database
      // const savedBanner = await createBanner.save();
      // console.log("savedBanner: ", savedBanner);

      res.status(201).json({
          success: true,
          message: "Hoem page selected book created successfully",
          createBanner
      });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
          success: false,
          message: "Failed to create banner",
          error: error.message // Optional: Send detailed error message
      });
  }
}

module.exports = {
  registerSabAdmin,
  loginSabAdmin,
  getAllSabAdmins,
  singleDeleteSabAdminWithId,
  processRefund,
  getAllUsersRefundDetails,
};
