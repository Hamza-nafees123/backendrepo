const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin-Model.js');

const registerAdmin = async (req, res, next) => {

    try {
        const { username, password } = req.body;
        // console.log(req.body);

        if (!username || !password) {
            return res.status(403).json({ message: "Required parameters missing" });
        }

        const userExists = await Admin.findOne({ username });
        // console.log("userExists :", userExists);

        if (userExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log("hashedPassword :", hashedPassword);

        const createAdmin = await Admin.create({ username, password: hashedPassword });
        // console.log("createAdmin :", createAdmin);

        res.status(201).json({
            message: "Admin register successfully",
            createAdmin
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

const loginAdmin = async (req, res, next) => {

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(403).json({ message: "Required parameters missing" });
        }
        const user = await Admin.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(404).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { userId: user._id, },
            process.env.JWT_SECRET,
            { expiresIn: "5h" }
        );
        // console.log("Login token :", token);
        res
            .status(201)
            .cookie("Hassan_Nadeem", token, {
                maxage: 15 * 24 * 60 * 60 * 1000,
                sameSite: "none",
                httpOnly: true,
                secure: true,
            })
            .json({ message: `Login successful in ${user?.username}`, token, user });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

const getAdminProfile = async (req, res, next) => {
    try {
        const user = await Admin.findById(req.user);
        console.log("user: ", user);

        if (!user) {
            return res.status(404).json({ message: "User is not found" })
        }

        res.status(200).json({ message: "Get admin profile successful", user });

    } catch (error) {
        console.log("error :", error);

    }
};

const logout = (req, res, next) => {
    try {
        res
            .status(200)
            .cookie("Hassan_Nadeem", "", {
                maxage: 0,
                sameSite: "none",
                httpOnly: true,
                secure: true,
            })
            .json({ message: "Logout successful" });
    } catch (error) {
        console.log("error :", error);
    }
};

// const updatePassword = async (req, res, next) => {
//     const { currentPassword, newPassword } = req.body;
//     // console.log("currentPassword, newPassword :", req.body);

//     if (!currentPassword || !newPassword) {
//         return res.status(400).json({ message: "Current password and new password are required" })
//     }

//     const adminId = req.params.id
//     // console.log("adminId :", adminId);

//     try {
//         const user = await Admin.findById(adminId);
//         // console.log("user :", user);

//         if (!user) {
//             return res.status(404).json({ message: "User not found" })
//         }

//         const isMatch = bcrypt.compare(currentPassword, user.password)
//         // console.log("isMatch :", isMatch);

//         if (!isMatch) {
//             return res.status(400).json({ message: 'Current password is incorrect' });
//         }

//         // Hash the new password
//         const salt = await bcrypt.genSalt(10);
//         // console.log("salt :", salt);

//         const hashedPassword = await bcrypt.hash(newPassword, salt);
//         // console.log("hashedPassword :", hashedPassword);

//         // Update the user's password
//         user.password = hashedPassword
//         await user.save()

//         res.status(200).json({ message: 'Password updated successfully' });


//     } catch (error) {
//         console.log("error: ", error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }

const updatePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Check if both currentPassword and newPassword are provided
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
    }

    const adminId = req.params.id;

    try {
        // Find the user by ID
        const user = await Admin.findById(adminId);

        // If user is not found, return a 404 error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the current password with the user's stored password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        // If the passwords do not match, return a 400 error
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // If the current password is correct, proceed to hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password with the new hashed password
        user.password = hashedPassword;
        await user.save();

        // Respond with a success message
        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        // Log the error and respond with a 500 error
        console.error("Error updating password: ", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const suspendUser = async (req, res) => {
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

const unsuspendUser = async (req, res) => {
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

const admindeleteApi = async (req, res, next) => {
    try {
        const id = req.params.id;
        // console.log("id: ", id);

        const deleteApi = await Admin.findByIdAndDelete(
            id
        );
        // console.log("deleteApi: ", deleteApi);

        if (!deleteApi) {
            return res.status(404).json({
                message: `Cannot delete user with id=${id}. Maybe user was not found!`,
            });
        }

        res
            .status(200)
            .json({ message: "User deleted successfully", deleteApi });
    } catch (error) {
        console.log("error :", error);
        res.status(500).json({
            message: `Could not user with id=${id}`,
            error: err.message,
        });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const getAllAdminApi = await Admin.find();
        // console.log("getAllAdminApi", getAllAdminApi);
        res.status(200).json({ message: "Get all Admin", getAllAdminApi });
    } catch (error) {
        console.log("error", error);
    }
};




module.exports = {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    logout,
    updatePassword,
    suspendUser,
    unsuspendUser,
    admindeleteApi,
    getAllAdmins
};

