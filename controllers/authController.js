const User = require("../models/UserModel");
const Vendor = require("../models/VendorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyPhone } = require("../helpers/verifyPhone");
const JWT_SECRET = process.env.JWT_SECRET;

const doUserSignup = async (req, res) => {
  const { name, username, phone, email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name,
    username: username,
    phone: phone,
    email: email,
    password: passwordHash,
  });

  const authTokenPayload = { _id: user._id };

  const authToken = jwt.sign(authTokenPayload, JWT_SECRET);

  const resUser = await User.findById(user._id).select("-password");

  return res.json({
    success: true,
    user: resUser,
    authToken,
  });
};

const checkDataExists = async (req, res) => {
  const { email, username, phone } = req.body;
  const usernameExists = await User.findOne({ username: username });
  const emailExists = await User.findOne({ email: email });
  const phoneExists = await User.findOne({ phone: phone });

  let response = {
    userExists: false,
    field: "",
  };
  if (usernameExists) {
    response.userExists = true;
    response.field = "username";
  } else if (emailExists) {
    response.userExists = true;
    response.field = "email";
  } else if (phoneExists) {
    response.userExists = true;
    response.field = "phone";
  }
  res.json(response);
};

function isEmail(emailInput) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(emailInput).toLowerCase());
}
const doUserLogin = async (req, res) => {
  try {
    const { field, password } = req.body;
    //   checking whether user entered username or email
    let userExists;
    if (isEmail(field)) {
      userExists = await User.findOne({ email: field });
      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: {
            statusCode: 404,
            field: "field",
            message: "Email does not exist",
          },
        });
      }
    } else {
      userExists = await User.findOne({ username: field });
      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: {
            statusCode: 404,
            field: "field",
            message: "Username does not exist",
          },
        });
      }
    }
    const passwordMatches = await bcrypt.compare(password, userExists.password);
    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        error: {
          statusCode: 400,
          field: "password",
          message: "Password is incorrect",
        },
      });
    }

    const authTokenPayload = { _id: userExists._id };
    const authToken = jwt.sign(authTokenPayload, JWT_SECRET);

    const resUser = await User.findById(userExists._id).select("-password");

    return res.json({
      success: true,
      user: resUser,
      authToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
};

const changeUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: {
        code: "pwd/pwd-abs",
        error: "Passwords missing",
      },
    });
  }
  const user = await User.findById(req.user._id);
  const oldPasswordMatches = await bcrypt.compare(oldPassword, user.password);
  if (!oldPasswordMatches) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        code: "auth/pwd-inc",
        message: "Old password is incorrect",
      },
    });
  }
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      password: newPasswordHash,
    },
  });
  return res.json({
    success: true,
  });
};

// input phone
const resetUserPassword = async (req, res) => {
  console.log(req.body);
  const phoneToken = req.headers.phonetoken;
  const { phone, newPassword } = req.body;
  if (!phoneToken) {
    return res.json({
      success: false,
      error: {
        code: "auth/tkn-abs",
        message: "PhoneToken not present in headers",
      },
    });
  }
  const phoneIsVerified = verifyPhone(phone, phoneToken);
  if (!phoneIsVerified) {
    return res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        code: "val/ph-inv",
        message: "Phone is not verified",
      },
    });
  }
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate(
    { phone: phone },
    {
      $set: {
        password: newPasswordHash,
      },
    }
  );
  return res.json({
    success: true,
  });
};

module.exports = {
  doUserSignup,
  doUserLogin,
  changeUserPassword,
  resetUserPassword,
  checkDataExists,
};
