const jwt = require("jsonwebtoken");

const verifyPhone = (phone, phoneToken) => {
  try {
    const payload = jwt.verify(phoneToken, process.env.JWT_SECRET);
    console.log(phone);
    if (payload.phone == phone) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

module.exports = { verifyPhone };
