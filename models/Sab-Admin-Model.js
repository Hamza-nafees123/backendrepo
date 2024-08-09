const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true

        },

        password: {
            type: String,
            required: true,
        },

    },
    { timestamps: true }
);


const sabAdmin = mongoose.model("SabAdmin", userSchema);

module.exports = sabAdmin;
