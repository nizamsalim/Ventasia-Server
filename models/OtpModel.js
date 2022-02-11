const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  expiry: Date,
  phone: String,
  otp: String,
});

module.exports = mongoose.model("otp", OtpSchema);
