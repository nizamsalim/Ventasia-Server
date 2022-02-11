const express = require("express");
const {
  doUserSignup,
  doUserLogin,
  changeUserPassword,
  resetUserPassword,
  checkDataExists,
} = require("../controllers/authController");
const {
  fetchUserFromAuthToken,
} = require("../middlewares/getUserIdFromAuthToken");
const { validateSignup } = require("../middlewares/validateUserSignup");
const router = express.Router();

// @route : POST /api/auth/user/signup
// @desc  : Creates new user
router.post("/user/signup", validateSignup, doUserSignup);

router.post("/user/checkdata", checkDataExists);

// @route : POST /api/auth/user/login
// @desc  : Login for user
router.post("/user/login", doUserLogin);

// @route : POST /api/auth/user/passwordchange
// @desc  : Change password - inside the app
router.post("/user/passwordchange", fetchUserFromAuthToken, changeUserPassword);

// @route : POST /api/auth/user/passwordreset
// @desc  : Reset password - outside the app
//          Requires otp verification
router.post("/user/passwordreset", resetUserPassword);

module.exports = router;
