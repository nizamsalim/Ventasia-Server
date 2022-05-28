const express = require("express");
const {
  doUserSignup,
  doUserLogin,
  changeUserPassword,
  resetUserPassword,
  checkDataExists,
  doVendorSignup,
  doVendorLogin,
} = require("../controllers/authController");
const {
  fetchUserFromAuthToken,
} = require("../middlewares/getUserIdFromAuthToken");
const { validateUserSignup } = require("../middlewares/validateUserSignup");
const router = express.Router();

// @route : POST /api/auth/user/signup
// @desc  : Creates new user
router.post("/user/signup", validateUserSignup, doUserSignup);

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

// @route : POST /api/auth/vendor/signup
// @desc  : Create new account for vendor
router.post("/vendor/signup", validateUserSignup, doVendorSignup);

// @route : POST /api/auth/vendor/login
// @desc  : Login vendor
router.post("/vendor/login", doVendorLogin);

module.exports = router;
