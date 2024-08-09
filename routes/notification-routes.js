const express = require('express');
const router = express.Router();
const notificationController = require('../controller/Notification-Controller.js');
// const authMiddleWare = require('../middleware/authMiddleware.js');

router.post('/create-notification', notificationController.addNotification);
router.get('/gell-all-notification', notificationController.getAllNotification);
router.put('/update-notification/:id', notificationController.EditNotification);
router.delete('/delete-notification/:id', notificationController.deleteNotification);
router.get('/find-all-notification', notificationController.findAllNotification);

module.exports = router;
