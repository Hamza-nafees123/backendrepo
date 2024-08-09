const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const homePageSelectedBook = new mongoose.Schema(
    {
        bookId: {
            type: Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
    },
    { timestamps: true }
);

const homePageSelected = mongoose.model("homePageSelectedBook", homePageSelectedBook);

module.exports = homePageSelected;
