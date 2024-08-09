const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const faqQuestionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    faqsCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'FaqCategory',
        required: true,
    },
}, { timestamps: true });

// Create a model based on the schema
const FaqsQuestion = mongoose.model('FaqQuestion', faqQuestionSchema);

module.exports = FaqsQuestion;
