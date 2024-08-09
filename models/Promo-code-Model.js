const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const couponCodeSchema = new Schema(
    {
        couponCodeName: {
            type: String,
            // unique: true,
            required: true,
        },
        discount: {
            type: String,
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// Index for faster search on code
couponCodeSchema.index({ couponCodeName: 1 });


couponCodeSchema.statics.removeExpired = async function () {
    //Abhi ka current time now ko get karo.
    //Abhi ka waqt now variable mein store karo.
    const now = new Date();
    console.log("now: ", now);
    //endDate ko current date par set karo aur din ke end tak valid rakho (23:59:59).
    //endDate variable mein current date le kar usko din ke akhir tak set karo (23:59:59).
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999); // Current date ko din ke end tak set karna
    console.log("endDate: ", endDate);

    //Sabhi expired coupons ko delete karo jinki endDate current endDate se chhoti hai.
    await this.deleteMany({ endDate: { $lt: endDate } });
};


// couponCodeSchema.statics.removeExpired = async function () {
//     // Abhi ka waqt
//     const now = new Date();
//     console.log("now: ", now);
//     // Aaj ke din ko end tak valid rakhne ke liye next day ke start ka time
//     const nextDay = new Date(now);
//     console.log("nextDay: ", nextDay);
//     nextDay.setDate(nextDay.getDate() + 1);
//     console.log("nextDay: ", nextDay);
//     nextDay.setHours(0, 0, 0, 0);
//     console.log("nextDay: ", nextDay);

//     // Sirf un coupons ko delete karo jinki endDate set hai aur wo expire ho chuke hain
//     await this.deleteMany({ endDate: { $lt: nextDay, $ne: null } });
// };


const CouponCodeDiscount = mongoose.model(
    "couponcode-discount-book",
    couponCodeSchema
);

module.exports = CouponCodeDiscount;