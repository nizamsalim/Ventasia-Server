require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const NODE_ENV = app.settings.env;
const port = process.env.PORT;

const { connectDatabase } = require("./config/databaseConfig");
const {
  mobileOtpVerificationSocket,
} = require("./helpers/otpVerificationSocket");

connectDatabase(NODE_ENV);

mobileOtpVerificationSocket();

var corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", require("./routes/authRouter"));

NODE_ENV == "development" &&
  app.listen(port, () => {
    console.log(`server started at ${port}`);
  });

module.exports = app;
