//Agar aapka promo code ki ending date 2024-07-28 hai, to yeh promo code 2024-07-28 ke din ke end tak valid rahega.
//Matlab yeh ke 2024-07-29 ka din start hone tak valid rahega (raat ke 12 baje tak).
//Jab removeExpired method chalti hai, to yeh check karegi ke endDate ka waqt guzar chuka hai ya nahi aur agar guzar chuka hai aur wo null nahi hai, to us promo code ko delete kar degi.
//Agar endDate empty hai (null ya undefined), to promo code tab tak delete nahi hoga jab tak admin khud se delete nahi karta.
//Is tara se aap ensure karenge ke promo code apne specified end date ke din ke end tak valid rahega aur uske baad hi remove hoga.

const CouponCodeDiscount = require("../models/Promo-code-Model.js");
// const { validationResult } = require("express-validator"); // Express-validator for validation

const addCouponCodeDiscount = async (req, res) => {
    const { couponCodeName, discount, startDate, endDate } = req.body;

    if (!couponCodeName || typeof discount !== "string") {
        return res.status(400).json({
            status: false,
            message: "Discount must be a percentage string and couponCodeName is required",
        });
    }

    // Percentage sign hatake number mein convert karo
    const discountValue = parseFloat(discount.replace("%", ""));
    if (isNaN(discountValue)) {
        return res.status(400).json({
            status: false,
            message: "Invalid discount value",
        });
    }

    try {
        const createCoupon = new CouponCodeDiscount({
            couponCodeName,
            discount,
            startDate,
            endDate: endDate || null // Ensure endDate is null if not provided
        });

        await createCoupon.save();

        return res.status(201).json({
            message: "Coupon created successfully",
            createCoupon,
        });
    } catch (error) {
        console.error("Error in addCouponCodeDiscount:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const getAllCouponCodes = async (req, res) => {
    try {
        const getAllCouponCode = await CouponCodeDiscount.find();
        // console.log("getAllCouponCode", getAllCouponCode);
        res.status(200).json({ message: "Get all coupons code", getAllCouponCode });
    } catch (error) {
        console.log("error", error);
    }
};

const SearchCouponCode = async (req, res, next) => {
    try {
        const { couponCodeName } = req.query;
        // Coupon search karne ka query
        const coupon = await CouponCodeDiscount.findOne({
            couponCodeName,
        });
        console.log("coupon: ", coupon);
        if (coupon) {
            res.status(200).json(coupon);
        } else {
            res.status(404).json({ message: "Coupon not found" });
        }
    } catch (error) {
        console.log("error :", error);
    }
};

const updateCouponCode = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Data to update cannot be empty!",
        });
    }

    const { id } = req.params;

    try {
        const updatedCouponCode = await CouponCodeDiscount.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true, // Return the updated document
                useFindAndModify: false,
            }
        );
        console.log("updatedCouponCode :", updatedCouponCode);
        if (!updatedCouponCode) {
            return res.status(404).json({
                message: `Cannot update coupon code with id=${id}. Maybe coupon code was not found!`,
            });
        }

        res.status(200).json({
            message: "Coupon code was updated successfully.",
            updatedCouponCode,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error updating coupon code with id=${id}`,
            error: err.message,
        });
    }
};

const deleteCouponCode = async (req, res, next) => {
    try {
        const deletedCouponId = req.params.id;
        console.log("deletedCouponId: ", deletedCouponId);

        const deleteCoupon = await CouponCodeDiscount.findByIdAndDelete(
            deletedCouponId
        );
        console.log("deleteCoupon: ", deleteCoupon);

        if (!deleteCoupon) {
            return res.status(404).json({
                message: `Cannot delete coupon code with id=${deletedCouponId}. Maybe coupon code was not found!`,
            });
        }

        res
            .status(200)
            .json({ message: "Coupon code deleted successfully", deleteCoupon });
    } catch (error) {
        console.log("error :", error);
        res.status(500).json({
            message: `Could not delete coupon code with id=${deletedCouponId}`,
            error: err.message,
        });
    }
};

// Middleware to check if a promo code is expired
// const checkPromoCodeValidity = async (req, res, next) => {
//     try {
//         const coupon = await CouponCodeDiscount.findOne({ couponCodeName: req.body.couponCodeName });

//         if (!coupon) {
//             return res.status(404).json({ message: 'Promo code not found' });

//         }
//         if (coupon.endDate < new Date()) {
//             return res.status(400).json({ message: 'Promo code is expired' });
//         }
//         next();
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

//Yeh function yeh check karta hai ke promo code valid hai ya expire ho gaya hai.
// const checkPromoCodeValidity = async (req, res, next) => {
//     try {
//         //Coupon ko find karo couponCodeName se.
//         const coupon = await CouponCodeDiscount.findOne({ couponCodeName: req.body.couponCodeName });

//         if (!coupon) {
//             return res.status(404).json({ message: 'Promo code not found' });
//         }

//         //now current time ko get karo.
//         //Abhi ka waqt now variable mein store karo.
//         const now = new Date();
//         //endDate variable ko coupon ki endDate pe set karo aur din ke end tak valid rakho (23:59:59).
//         //endDate variable mein coupon ki end date le kar usko din ke akhir tak set karo (23:59:59).
//         const endDate = new Date(coupon.endDate);
//         endDate.setHours(23, 59, 59, 999); // End date ko din ke end tak valid rakhna

//         //Agar start time abhi se baad ka hai, to "Promo code is not yet active" message bhejta hai.
//         //Agar end date abhi ke waqt se pehle hai, to "Promo code is expired" message bhejo.
//         if (coupon.startDate > now) {
//             return res.status(400).json({ message: 'Promo code is not yet active' });
//         }

//         //Agar end time abhi se pehle ka hai, to "Promo code is expired" message bhejta hai.
//         if (endDate < now) {
//             return res.status(400).json({ message: 'Promo code is expired' });
//         }

//         //Agar sab kuch sahi ho to next() call karo taake request process continue ho.
//         next();
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };




const checkPromoCodeValidity = async (req, res, next) => {
    try {
        // Coupon ko find karo couponCodeName se
        const coupon = await CouponCodeDiscount.findOne({ couponCodeName: req.body.couponCodeName });

        if (!coupon) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        // Current time ko get karo
        const now = new Date();

        // Coupon ke startDate aur endDate ko din ke end tak set karo
        const startDate = new Date(coupon.startDate);
        const endDate = new Date(coupon.endDate);
        endDate.setHours(23, 59, 59, 999); // End date ko din ke end tak set karna

        // Check if current date is before startDate
        if (now < startDate) {
            return res.status(400).json({ status: "error", code: 400, message: 'Promo code is not yet active' });
        }

        // Check if current date is after endDate
        if (now > endDate) {
            return res.status(400).json({ status: "error", code: 400, message: 'Promo code is expired' });
        }

        // Everything is fine, proceed with the request
        next();
    } catch (error) {
        res.status(500).json({ status: "error", code: 500, message: error.message });
    }
};












module.exports = {
    addCouponCodeDiscount,
    getAllCouponCodes,
    SearchCouponCode,
    updateCouponCode,
    deleteCouponCode,
    checkPromoCodeValidity
}; 