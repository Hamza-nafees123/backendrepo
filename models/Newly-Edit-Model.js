const mongoose = require("mongoose");

const newlyEditSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
});



const newly = mongoose.model("newly-edits", newlyEditSchema);

module.exports = newly;
