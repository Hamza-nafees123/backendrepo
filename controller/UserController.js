const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel.js");
const Category = require("../models/CategoryModel.js");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();
// this api is working
// exports.registerUser = async (req, res) => {
//   try {
//     const {
//       firstname,
//       lastname,
//       email,
//       // userMessage,
//       password,
//       gender,
//       // status,
//       latitude,
//       longitude,
//     } = req.body;

//     if (
//       !firstname ||
//       !lastname ||
//       !email ||
//       // !userMessage ||
//       !password ||
//       !gender ||
//       // !status ||
//       !latitude ||
//       !longitude
//     ) {
//       return res.status(400).json({ message: "Required Parameter missing" });
//     }

//     // Check if user already exists
//     let existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User already exists with this email" });
//     }
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user instance
//     const newUser = new User({
//       firstname,
//       lastname,
//       email,
//       location: {
//         type: "Point",
//         coordinates: [
//           parseFloat(req.body.longitude),
//           parseFloat(req.body.latitude),
//         ],
//       },
//       // userMessage,
//       password: hashedPassword,
//       gender,
//       // status,
//     });
//     console.log("newUser :", newUser);

//     // Save user to database
//     await newUser.save();
//     // console.log("newUser: ", newUser);

//     // // Generate JWT token
//     // const registerToken = jwt.sign({ userId: newUser._id, email: newUser.email }, 'your-secret-key', { expiresIn: '5h' });
//     // console.log("registerToken: ", registerToken);

//     // Send success response with token
//     res.status(201).json({
//       message: "User registered successfully",
//       newUser,
//     });
//   } catch (error) {
//     // Handle errors
//     console.error("Error registering user:", error);
//     res
//       .status(500)
//       .json({ message: "Error registering user", error: error.message });
//   }
// };

exports.registerUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      gender,
      latitude,
      longitude,
      paymentPlanId,
      remainingDownloads,
      cardDetailsId,
      downloadToken,
      planExpiryDate,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !gender ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "Required Parameter missing" });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user instance
    const newUser = new User({
      firstname,
      lastname,
      email,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      password: hashedPassword,
      gender,
      paymentPlanId: paymentPlanId || null, // Default null if no plan
      remainingDownloads: remainingDownloads || 0,
      cardDetailsId: cardDetailsId || null,
      downloadToken: downloadToken || null,
      planExpiryDate: planExpiryDate || null,
    });

    // console.log("newUser :", newUser);

    // Save user to database
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// this api is working
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is suspended
    if (user.isSuspended) {
      return res
        .status(403)
        .json({ message: "User is suspended. Please contact support." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const loginToken = jwt.sign(
      { userId: user._id, email: user.email },
      "Hassan_Nadeem",
      { expiresIn: "5h" }
    );
    // console.log("loginToken: ", loginToken);

    // Send success response with loginToken
    res.status(200).json({
      message: "User logged in successfully",
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

exports.updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Check if both currentPassword and newPassword are provided
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current password and new password are required" });
  }

  const userId = req.params.id;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // If user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the current password with the user's stored password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    // If the passwords do not match, return a 400 error
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // If the current password is correct, proceed to hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password with the new hashed password
    user.password = hashedPassword;
    await user.save();

    // Respond with a success message
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    // Log the error and respond with a 500 error
    console.error("Error updating password: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Yeh controller database se users ko fetch karta hai jo specific location ke aas paas hote hain. Ismein kuch steps hain:
// exports.getAllUser = async (req, res) => {
//   try {
//     const { longitude, latitude } = req.query; // Use req.query for query parameters
//     // Validate query parameters
//     if (!longitude || !latitude) {
//       return res.status(400).json({
//         error: "Longitude and latitude are required in query parameters.",
//       });
//     }

//     // Convert longitude and latitude to numbers
//     const lng = parseFloat(longitude);
//     const lat = parseFloat(latitude);

//     //MongoDB ke $geoNear aggregation stage ka use karke users ko location ke aas paas search kiya jaata hai.
//     //  maxDistance ke zariye search radius specify kiya jaata hai.

//     // Perform aggregation query using $geoNear
//     const users = await User.aggregate([
//       {
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates: [lng, lat],
//           },
//           key: "location",
//           maxDistance: parseFloat(10000) * 1609, // Convert to miles
//           distanceField: "dist.calculated",
//           spherical: true,
//         },
//       },
//     ]);

//     console.log("users: ", users);

//     // Respond with JSON array of users
//     res.status(200).json({ message: "Get all users successfully", users });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching users", error: error.message });
//   }
// };

exports.getAllUsers = async (req, res, next) => {
  try {
    const findAllUsers = await User.find({ isSuspended: false });
    // console.log("findAllUsers: ", findAllUsers);
    res
      .status(200)
      .json({ message: "Get all users successfully", findAllUsers });
  } catch (error) {
    console.log("error: ", error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // Step 1: User Email Find Karna
    const user = await User.findOne({ email: req.body.email });
    console.log("user: ", user);
    if (!user) return res.status(400).json({ message: "Email not found" });

    // Step 2: Token Generate Karna
    const token = jwt.sign({ _id: user._id }, "Hassan_Nadeem", {
      expiresIn: "5h",
    });
    console.log("token: ", token);

    // Step 3: Email Send Karna
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "123@example.com", // Apna email yahan likhein
        pass: "Hassan741883", // Apna email password yahan likhein
      },
    });
    console.log("transporter: ", transporter);

    const mailOptions = {
      from: "Professionalwebdeveloper123@gmail.com", // Sender ka email
      to: user.email, // Receiver ka email
      subject: "Password Reset", // Email ka subject
      text: `Please use the following token to reset your password: ${token}`, // Email ka text
    };
    console.log("mailOptions: ", mailOptions);

    await transporter.sendMail(mailOptions);

    // Step 4: Response Send Karna
    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    // Step 5: Error Handling
    res.status(500).json({ message: error.message });
  }
};

// this api is working
// exports.getAllUser = async (req, res) => {
//   try {
//     const { longitude, latitude } = req.body;
//     // Validate query parameters
//     if (!longitude || !latitude) {
//       return res.status(400).json({
//         error:
//           "Longitude, latitude, and radius are required in query parameters.",
//       });
//     }

//     const users = await User.aggregate([
//       {
//         $geoNear: {
//           near: {
//             type: "Point",
//             coordinates: [parseFloat(longitude), parseFloat(latitude)],
//           },
//           maxDistance: parseFloat(1000) * 1609,
//           distanceField: "dist.calculated",
//           spherical: true,
//         },
//       },
//     ]);
//     console.log("users: ", users);

//     res.status(200).json({ message: "Get all users successfully", users }); // Respond with JSON array of users
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching users", error: error.message });
//   }
// };

// this api is working

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    // console.log("name: ", name);
    const category = new Category({ name });
    // console.log("category: ", category);
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// this api is working
exports.getCate = async (req, res) => {
  try {
    const users = await Category.find(); // Fetch all users from MongoDB
    // console.log("users: ", users);
    res.status(200).json({ message: "Get all category successfully", users }); // Respond with JSON array of users
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// this api is working
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    // console.log("categoryId: ", categoryId);

    // Pehle check karo ke category exist karti hai ya nahi
    const deletedCategory = await Category.findById(categoryId);
    // console.log("deletedCategory: ", deletedCategory);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Agar category mil gayi toh delete karo
    await Category.findByIdAndDelete(categoryId);

    res
      .status(200)
      .json({ message: "Category deleted successfully", deletedCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User suspended successfully", user });
  } catch (error) {
    console.error("Error suspending user:", error);
    res.status(500).json({ message: "Error suspending user", error });
  }
};

exports.unsuspendUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User unsuspended successfully", user });
  } catch (error) {
    console.error("Error unsuspending user:", error);
    res.status(500).json({ message: "Error unsuspending user", error });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const suspendedUsers = await User.find({ isSuspended: true });
    // const unsuspendedUsers = await User.find({ isSuspended: false });

    res.status(200).json({
      message: "Users fetched successfully",
      suspendedUsers,
      // unsuspendedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

exports.admindeleteApi = async (req, res, next) => {
  try {
    const id = req.params.id;
    // console.log("id: ", id);

    const deleteApi = await User.findByIdAndDelete(id);
    // console.log("deleteApi: ", deleteApi);

    if (!deleteApi) {
      return res.status(404).json({
        message: `Cannot delete user with id=${id}. Maybe user was not found!`,
      });
    }

    res.status(200).json({ message: "User deleted successfully", deleteApi });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({
      message: `Could not user with id=${id}`,
      error: err.message,
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    // JWT middleware se jo user ID mila hai usse user ko find karo
    const user = await User.findById(req.user.id);
    console.log("Login user token: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // User ki profile return karo
    res.status(200).json({ message: "Get my profile", user });
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
