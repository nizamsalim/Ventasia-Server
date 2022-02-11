const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { verifyPhone } = require("../helpers/verifyPhone");

const validateSignup = async (req, res, next) => {
  const { name, username, phone, email, password, phoneToken } = req.body;
  if (!name || !username || !email || !password) {
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
  const emailExists = await User.findOne({ email: email });
  const phoneExists = await User.findOne({ phone: phone });
  const emailIsValid = validateEmail(email);
  const passwordIsValid = password.length > 6 ? true : false;
  const phoneIsValid = phone ? validatePhone(phone) : true;
  const phoneIsVerified = phone ? verifyPhone(phone, phoneToken) : true;

  function validateEmail(emailInput) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(emailInput).toLowerCase());
  }
  function validatePhone(phoneInput) {
    const re = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    return re.test(String(phoneInput));
  }

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
module.exports = { validateSignup };
