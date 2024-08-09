const express = require('express');
const router = express.Router();
const sabAdminController = require('../controller/Sab-Admin-Controller.js');


router.post('/register', sabAdminController.registerSabAdmin);
router.post('/login', sabAdminController.loginSabAdmin);
router.get('/get-all', sabAdminController.getAllSabAdmins);
router.get('/refund-details/', sabAdminController.getAllUsersRefundDetails);
// router.put('/:id', sabAdminController.updatePassword);
router.delete('/single-delete/:id', sabAdminController.singleDeleteSabAdminWithId);
router.post('/refund/:userId', sabAdminController.processRefund);

module.exports = router;
