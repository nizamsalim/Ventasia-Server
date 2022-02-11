const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  address: {
    type: {
      houseNumber: String,
      streetName: String,
      cityName: String,
      stateName: String,
      countryName: String,
      pinCode: String,
    },
  },
});

module.exports = mongoose.model("user", UserSchema);
