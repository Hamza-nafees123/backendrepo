const Audio = require('../models/Audio-Category-Model');

const createAudioBook = async (req, res, next) => {
    try {
        const name = req.body
        console.log("name :", name);

        if (!name) {
            return res.status(400).json({ message: "Required parameter missing" })
        }

        const createData = await Audio.create(name)
        console.log("createData :", createData);


        res.status(200).json({ message: "Audio book created succesfully", data: createData })


    } catch (error) {
        console.log("error :", error);

    }
}
const getAllAudioBooks = async (req, res, next) => {
    try {
        const audioBooks = await Audio.find();
        console.log("audioBooks", audioBooks);

        if (audioBooks.length === 0) {
            return res.status(404).json({ message: "No audio books found" });
        }

        res.status(200).json({ message: "Get all audio books succesfully", data: audioBooks })


    } catch (error) {
        console.log("error :", error);
    }
}

const deleteAudioBooks = async (req, res, next) => {
    try {
        const deletedAudioBook = req.params.id
        console.log("deletedAudioBook: ", deletedAudioBook);

        // const AudioBook = await Audio.findById(deletedAudioBook)
        // console.log("AudioBook: ", AudioBook);

        // if (!AudioBook) {
        //     return res.status(404).json({ message: "Audio Book not found", });
        // }

        // Agar category mil gayi toh delete karo
        await Audio.findByIdAndDelete(deletedAudioBook);

        res.status(200).json({ message: "audio book deleted successfully" });


    } catch (error) {
        console.log("error :", error);
        // res.status(500).json({ message: err.message });

    }
}

module.exports = { createAudioBook, getAllAudioBooks, deleteAudioBooks }