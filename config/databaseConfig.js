const mongoose = require("mongoose");
const DB = process.env.DB;
const DB_TEST = process.env.DB_TEST;

const User = require("../models/UserModel");
const Vendor = require("../models/VendorModel");

const connectDatabase = async (NODE_ENV) => {
  const uri = NODE_ENV == "development" ? DB : DB_TEST;
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  NODE_ENV == "development" && console.log("database connected");
};

const disconnectDatabase = async () => {
  // await clearDatabase();
  await mongoose.connection.close();
  await mongoose.disconnect();
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Vendor.deleteMany({});
};

module.exports = { connectDatabase, disconnectDatabase, clearDatabase };
