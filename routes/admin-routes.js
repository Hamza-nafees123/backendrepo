const express = require('express');
const { registerAdmin, loginAdmin, getAdminProfile, logout, updatePassword, admindeleteApi, suspendUser, unsuspendUser, getAllAdmins } = require('../controller/Admin.Controller');
// const authMiddleware = require('../middleware/authMiddleware'); // Remove destructuring if it's default export
const router = express.Router();


// Directly use imported functions
router.post('/register', registerAdmin);
router.post('/user/suspend/:id', suspendUser);
router.post('/user/unsuspend/:id', unsuspendUser);
router.post('/login', loginAdmin);
router.get('/get-admin-profile', getAdminProfile);
router.get('/get-all-admin', getAllAdmins);
router.get("/logout", logout);
router.put("/:id", updatePassword);
router.delete("/:id", admindeleteApi);


module.exports = router;
