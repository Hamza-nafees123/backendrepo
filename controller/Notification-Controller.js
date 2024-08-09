const Notification = require("../models/Notification-Model.js");

const addNotification = async (req, res) => {

    try {
        const { title, description, date } = req.body;
        const createNotification = new Notification({
            title, description, date
        });

        await createNotification.save();

        return res.status(201).json({
            message: "Notification created successfully",
            createNotification,
        });
    } catch (error) {
        console.error("Error in notification:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const EditNotification = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Data to update cannot be empty!",
        });
    }

    const { id } = req.params;

    try {
        const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true, // Return the updated document
                useFindAndModify: false,
            }
        );
        // console.log("updatedNotification :", updatedNotification);
        if (!updatedNotification) {
            return res.status(404).json({
                message: `Cannot update notification with id=${id}. Maybe notification was not found!`,
            });
        }

        res.status(200).json({
            message: "Notification was updated successfully.",
            updatedNotification,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error updating notification with id=${id}`,
            error: err.message,
        });
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        const id = req.params.id;
        console.log("id: ", id);

        const deleteNoti = await Notification.findByIdAndDelete(
            id
        );
        // console.log("deleteNoti: ", deleteNoti);

        if (!deleteNoti) {
            return res.status(404).json({
                message: `Cannot delete notification with id=${id}. Maybe notification was not found!`,
            });
        }

        res
            .status(200)
            .json({ message: "Notification deleted successfully", deleteNoti });
    } catch (error) {
        console.log("error :", error);
        res.status(500).json({
            message: `Could not delete notification with id=${id}`,
            error: err.message,
        });
    }
};

// const getAllNotification = async (req, res) => {
//     try {
//         const userId = req.query.userId; // URL se userId lein
//         // console.log("userId: ", userId);
//         const notificationId = req.query.notificationId; // URL se notificationId lein
//         // console.log("notificationId: ", notificationId);

//         if (!userId) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         if (!notificationId) {
//             return res.status(400).json({ message: 'Notification ID is required' });
//         }

//         // Specific notification ko database se fetch kiya
//         const notification = await Notification.findById(notificationId);
//         // console.log("notification: ", notification);

//         if (!notification) {
//             return res.status(404).json({ message: 'Notification not found' });
//         }

//         //notification.browse array ko check karte hain ke user ka click already exist karta hai ya nahi.
//         let userClick = notification.browse.find(click => click.userId.toString() === userId);
//         // console.log("userClick: ", userClick);




//         //Agar user ka click nahi milta to:
//         //    findByIdAndUpdate function se specific notification ko update karte hain.browse array main user ka click add karte hain aur totalClicks ko increment karte hain.
//         //    Updated notification ko dobara fetch karte hain.
//         //    browse field ko exclude karke baaki saara data response main return karte hain.
//         //    Agar user ka click already exist karta hai to:
//         //    browse field ko exclude karke baaki saara data response main return karte hain ke notification already updated hai.

//         if (!userClick) {
//             // Sirf relevant notification update karenge
//             await Notification.findByIdAndUpdate(notificationId, {
//                 $push: { browse: { userId } },
//                 $inc: { totalClicks: 1 }
//             }, { new: true });

//             // Updated notification ko dobara fetch karenge
//             const updatedNotification = await Notification.findById(notificationId);
//             // console.log("updatedNotification: ", updatedNotification);

//             // Browse ko exclude karke baaki saara data return karein
//             const { browse, ...rest } = updatedNotification.toObject();
//             res.status(200).json({ message: 'Notification updated', notification: rest });
//         } else {
//             const { browse, ...rest } = notification.toObject();
//             res.status(200).json({ message: 'Notification already updated', notification: rest });
//         }
//     } catch (error) {
//         console.log('error', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

const findAllNotification = async (req, res) => {
    try {

        // Specific notification ko database se fetch kiya
        const notification = await Notification.find();
        // console.log("notification: ", notification);

        res.status(200).json({ message: 'Find all notificcations', notification });

    } catch (error) {
        console.log('error', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

const getAllNotification = async (req, res) => {
    try {
        const userId = req.query.userId; // URL se userId lein
        const notificationId = req.query.notificationId; // URL se notificationId lein

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (!notificationId) {
            return res.status(400).json({ message: 'Notification ID is required' });
        }

        // Specific notification ko database se fetch kiya
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Notification main user ka click add karna aur totalClicks increment karna
        await Notification.findByIdAndUpdate(notificationId, {
            $push: { browse: { userId } },
            $inc: { totalClicks: 1 }
        }, { new: true });

        // Updated notification ko dobara fetch karte hain.
        const updatedNotification = await Notification.findById(notificationId);

        // Browse ko exclude karke baaki saara data return karein
        const { browse, ...rest } = updatedNotification.toObject();
        res.status(200).json({ message: 'Notification updated', notification: rest });
    } catch (error) {
        console.log('error', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



module.exports = {
    addNotification,
    getAllNotification,
    EditNotification,
    deleteNotification,
    findAllNotification
}; 
