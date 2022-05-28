const User = require("../models/UserModel");
const Vendor = require("../models/VendorModel");
const { verifyPhone } = require("../helpers/verifyPhone");

function validateEmail(emailInput) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(emailInput).toLowerCase());
}
function validatePhone(phoneInput) {
  const re = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  return re.test(String(phoneInput));
}

const validateUserSignup = async (req, res, next) => {
  const {
    name,
    username,
    phone,
    email,
    password,
    phoneToken,
    userType,
    thumbnail,
    gstNumber,
    category,
  } = req.body;
  if (
    !name ||
    (userType == "user" && !username) ||
    !email ||
    !password ||
    (userType === "vendor" && (!thumbnail || !gstNumber || !category))
  ) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        code: "val/inp-inv",
        message: "Required values not present in request body",
      },
    });
  }

  if (phone && !phoneToken) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        code: "val/phtkn-abs",
        message: "Phone token not present in request body",
      },
    });
  }

  // validation checks
  const usernameExists = await User.findOne({ username: username });

  let emailExists;
  let phoneExists;

  if (userType == "user") {
    emailExists = await User.findOne({ email: email });
    phoneExists = await User.findOne({ phone: phone });
  } else if (userType == "vendor") {
    emailExists = await Vendor.findOne({ email: email });
    phoneExists = await Vendor.findOne({ phone: phone });
  }

  const emailIsValid = validateEmail(email);
  const passwordIsValid = password.length > 6 ? true : false;
  const phoneIsValid = phone ? validatePhone(phone) : true;
  const phoneIsVerified = phone ? verifyPhone(phone, phoneToken) : true;

  if (usernameExists) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        field: "username",
        message: "Username is already taken",
      },
    });
  }
  if (emailExists) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        field: "email",
        message: "Email already exists",
      },
    });
  }
  if (phoneExists) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        field: "phone",
        message: "Phone number already exists",
      },
    });
  }
  if (!emailIsValid) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        field: "email",
        message: "Email is invalid",
      },
    });
  }
  if (!passwordIsValid) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        field: "password",
        message: "Password should be atleast 6 characters long",
      },
    });
  }
  if (!phoneIsValid) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        field: "phone",
        message: "Phone is in invalid format",
      },
    });
  }
  if (!phoneIsVerified) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        field: "phone",
        message: "Phone is not verified",
      },
    });
  }
  next();
};

module.exports = { validateUserSignup };
