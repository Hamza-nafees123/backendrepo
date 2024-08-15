//Agar aapka promo code ki ending date 2024-07-28 hai, to yeh promo code 2024-07-28 ke din ke end tak valid rahega.
//Matlab yeh ke 2024-07-29 ka din start hone tak valid rahega (raat ke 12 baje tak).
//Jab removeExpired method chalti hai, to yeh check karegi ke endDate ka waqt guzar chuka hai ya nahi aur agar guzar chuka hai aur wo null nahi hai, to us promo code ko delete kar degi.
//Agar endDate empty hai (null ya undefined), to promo code tab tak delete nahi hoga jab tak admin khud se delete nahi karta.
//Is tara se aap ensure karenge ke promo code apne specified end date ke din ke end tak valid rahega aur uske baad hi remove hoga.

const CouponCodeDiscount = require("../models/Promo-code-Model.js");
const moment = require("moment"); // Ensure ke moment library install ho aur import ho

// const addCouponCodeDiscount = async (req, res) => {
//     const { couponCodeName, discount, startDate, endDate } = req.body;

//     if (!couponCodeName || typeof discount !== "string") {
//         return res.status(400).json({
//             status: false,
//             message: "Discount must be a percentage string and couponCodeName is required",
//         });
//     }

//     // Percentage sign hatake number mein convert karo
//     const discountValue = parseFloat(discount.replace("%", ""));
//     if (isNaN(discountValue)) {
//         return res.status(400).json({
//             status: false,
//             message: "Invalid discount value",
//         });
//     }

//     try {
//         const createCoupon = new CouponCodeDiscount({
//             couponCodeName,
//             discount,
//             startDate,
//             endDate: endDate || null // Ensure endDate is null if not provided
//         });

//         await createCoupon.save();

//         return res.status(201).json({
//             message: "Coupon created successfully",
//             createCoupon,
//         });
//     } catch (error) {
//         console.error("Error in addCouponCodeDiscount:", error);
//         return res.status(500).json({
//             status: false,
//             message: "Something went wrong",
//             error: error.message,
//         });
//     }
// };

const addCouponCodeDiscount = async (req, res) => {
  const { couponCodeName, discount, startDate, endDate } = req.body;

  if (!couponCodeName || typeof discount !== "string") {
    return res.status(400).json({
      status: false,
      message: "Coupon name aur discount zaroori hain",
    });
  }

  // Discount ko percentage sign hataake number mein convert karo
  const discountValue = parseFloat(discount.replace("%", ""));
  if (isNaN(discountValue)) {
    return res.status(400).json({
      status: false,
      message: "Invalid discount value",
    });
  }

  // Dates ko validate karo
  const start = moment(startDate, "YYYY-MM-DD", true);
  console.log("StartDate :", start)
  const end = endDate ? moment(endDate, "YYYY-MM-DD", true) : null;
  console.log("endtDate :", end)

  if (!start.isValid()) {
    return res.status(400).json({
      status: false,
      message: "Invalid startDate format",
    });
  }

  if (end && !end.isValid()) {
    return res.status(400).json({
      status: false,
      message: "Invalid endDate format",
    });
  }

  // Ensure ke endDate startDate se baad ho
  if (end && end.isBefore(start)) {
    return res.status(400).json({
      status: false,
      message: "endDate startDate se baad ho",
    });
  }

  try {
    const createCoupon = new CouponCodeDiscount({
      couponCodeName,
      discount,
      startDate: start.toDate(),
      endDate: end ? end.toDate() : null, // Agar endDate nahi hai to null rakho
    });

    await createCoupon.save();

    return res.status(201).json({
      message: "Coupon create kar diya gaya hai",
      createCoupon,
    });
  } catch (error) {
    console.error("Error in addCouponCodeDiscount:", error);
    return res.status(500).json({
      status: false,
      message: "Kuch galat ho gaya",
      error: error.message,
    });
  }
};

// const applyCouponCode = async (req, res) => {
//   const { couponCodeName } = req.body;

//   if (!couponCodeName) {
//     return res.status(400).json({
//       status: false,
//       message: "Coupon name zaroori hai",
//     });
//   }

//   try {
//     // Coupon code ko database se fetch karna
//     const coupon = await CouponCodeDiscount.findOne({ couponCodeName });

//     if (!coupon) {
//       return res.status(404).json({
//         status: false,
//         message: "Coupon not found",
//       });
//     }

//     const now = moment(); // Current date aur time
//     const start = moment(coupon.startDate);
//     const end = coupon.endDate ? moment(coupon.endDate) : null;

//     // Check karein ke current date startDate aur endDate ke beech hai ya nahi
//     if (now.isBefore(start)) {
//       return res.status(400).json({
//         status: false,
//         message: "Coupon abhi tak active nahi hua",
//       });
//     }

//     if (end && now.isAfter(end)) {
//       return res.status(400).json({
//         status: false,
//         message: "Coupon expire ho chuka hai",
//       });
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Coupon apply ho gaya hai",
//       coupon,
//     });
//   } catch (error) {
//     console.error("Error in applyCouponCode:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Kuch galat ho gaya",
//       error: error.message,
//     });
//   }
// };

const getAllCouponCodes = async (req, res) => {
  try {
    const getAllCouponCode = await CouponCodeDiscount.find();
    // console.log("getAllCouponCode", getAllCouponCode);
    res.status(200).json({ message: "Get all coupons code", getAllCouponCode });
  } catch (error) {
    console.log("error", error);
  }
};

// const SearchCouponCode = async (req, res, next) => {
//   try {
//     const { couponCodeName } = req.query;
//     // Coupon search karne ka query
//     const coupon = await CouponCodeDiscount.findOne({
//       couponCodeName,
//     });
//     console.log("coupon: ", coupon);
//     if (coupon) {
//       res.status(200).json(coupon);
//     } else {
//       res.status(404).json({ message: "Coupon not found" });
//     }
//   } catch (error) {
//     console.log("error :", error);
//   }
// };

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

const SearchCouponCode = async (req, res, next) => {
  try {
    const { couponCodeName } = req.query;

    // Coupon search karne ka query
    const coupon = await CouponCodeDiscount.findOne({ couponCodeName });

    if (!coupon) {
      return res.status(404).json({
        status: false,
        message: "Coupon not found",
      });
    }

    // Current date aur time
    const now = moment();
    const start = moment(coupon.startDate);
    const end = coupon.endDate ? moment(coupon.endDate) : null;

    // Check karein ke current date startDate aur endDate ke beech hai ya nahi
    if (now.isBefore(start)) {
      return res.status(400).json({
        status: false,
        message: "Promo code is not active",
      });
    }

    if (end && now.isAfter(end)) {
      return res.status(400).json({
        status: false,
        message: "The Promo code has expired",
      });
    }

    // Coupon valid hai
    return res.status(200).json({
      status: true,
      message: "Coupon found",
      coupon,
    });
  } catch (error) {
    console.error("Error in SearchCouponCode:", error);
    return res.status(500).json({
      status: false,
      message: "Kuch galat ho gaya",
      error: error.message,
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

module.exports = {
  addCouponCodeDiscount,
  //   applyCouponCode,
  getAllCouponCodes,
  SearchCouponCode,
  updateCouponCode,
  deleteCouponCode,
};
