const express = require("express");
const router = express.Router();
const userController = require("../controller/UserController");
const middleWare = require("../middleware/authMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/user/suspend/:id", userController.suspendUser);
router.post("/user/unsuspend/:id", userController.unsuspendUser);
router.get("/get-all-users", userController.getAllUsers);
router.get(
  "/get-my-profile",
  middleWare.authMiddleware,
  userController.getMyProfile
);
router.get("/get-all-suspend-user", userController.getUsers);
router.put("/user/:id", userController.updatePassword);
router.delete("/user/:id", userController.admindeleteApi);
router.post("/forget-password", userController.forgotPassword);
// router.post('/get-all-users',userController.getAllUser);
router.post("/addcate", userController.createCategory);
router.get("/getCate", userController.getCate);
router.delete("/delete-cate/:id", userController.deleteCategory);

module.exports = router;
