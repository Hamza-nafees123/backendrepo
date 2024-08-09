const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const notificationsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    totalClicks: {
        type: Number,
        default: 0
    },
    browse: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User', // assuming you have a User model
                required: true
            }
        }
    ],
    date: {
        type: Date,
        required: true,
    }

}, { timestamps: true });

// Create a model based on the schema
const Notifications = mongoose.model('Notifications', notificationsSchema);

module.exports = Notifications;
