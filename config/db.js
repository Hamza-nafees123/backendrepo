const mongoose = require("mongoose");

const mongodbURI =
    process.env.mongodbURI ||
    "mongodb+srv://areebm2001:peVl1GIQaEBokxCM@areeb.9arqlev.mongodb.net/check?retryWrites=true&w=majority&appName=Areeb";

const connectDB = async () => {
    try {
        await mongoose.connect(mongodbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Mongoose is connected");
    } catch (err) {
        console.error("Mongoose connection error: ", err);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose is disconnected");
    process.exit(1);
});

process.on("SIGINT", () => {
    console.log("App is terminating");
    mongoose.connection.close(() => {
        console.log("Mongoose default connection closed");
        process.exit(0);
    });
});

module.exports = connectDB;
