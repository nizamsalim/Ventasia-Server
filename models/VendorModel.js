const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    address: {
      type: {
        buildingNumber: String,
        streetName: String,
        cityName: String,
        stateName: String,
        countryName: String,
        pinCode: String,
      },
    },
    comments: {
      type: [
        {
          username: { type: String, required: true },
          comment: { type: String, required: true },
        },
      ],
    },
    likes: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      max: 10,
    },
    thumbnail: {
      type: {
        filename: { type: String, required: true },
        url: { type: String, required: true },
      },
    },
    orderStatistics: {
      type: {
        completed: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("vendor", VendorSchema);
