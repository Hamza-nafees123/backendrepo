const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const AudioSchema = new Schema({
    name: {
        type: String,
        required: true
    },
});

// Create a model based on the schema
const Audio = mongoose.model('Audio', AudioSchema);

module.exports = Audio;
