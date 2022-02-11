require("dotenv").config();
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  SOCKET_PORT,
  JWT_SECRET,
} = process.env;

const twilio = require("twilio");
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const otpGenerator = require("otp-generator");
const Otp = require("../models/OtpModel");

const app = require("../index");

const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  },
});

const generateOtp = () => {
  const code = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  return code;
};

const generatePhoneToken = (phone) => {
  const payload = { phone: phone };
  const phoneToken = jwt.sign(payload, JWT_SECRET);
  return phoneToken;
};

const mobileOtpVerificationSocket = () => {
  io.of("/signupverification").on("connection", (socket) => {
    // console.log("client is connected");
    socket.on("disconnect", () => {
      console.log("clinet is disconnected");
    });
    socket.on(
      "trigger otp request for signup verification",
      async (data, callback) => {
        try {
          const { phone } = data;
          const otp = generateOtp();
          const expiry = new Date();
          expiry.setMinutes(expiry.getMinutes() + 60);
          const otps = await Otp.find({ phone: phone });
          if (otps) {
            await Otp.deleteMany({ phone: phone });
          }
          // await twilioClient.messages.create({
          //   body: `${otp} is your One-Time Password for Ventasia\nIt is valid for 5 minutes\nThank you.`,
          //   from: TWILIO_PHONE_NUMBER,
          //   to: `+91${phone}`,
          // });
          await Otp.create({
            phone,
            otp,
            expiry,
          });
          callback({ success: true });
        } catch (error) {
          callback({
            success: false,
            error: "Error in otp verification",
          });
        }
      }
    );

    socket.on("verify otp", async (data, callback) => {
      try {
        const { code, phone } = data;
        const codeInDatabase = await Otp.findOne({ phone: phone });
        if (!codeInDatabase) {
          callback({ success: false, error: "Otp not found" });
        } else {
          if (code !== codeInDatabase.otp) {
            callback({ success: false, error: "Incorrect otp" });
          } else if (Date.now() > codeInDatabase.expiry) {
            await Otp.deleteOne({ phone });
            callback({ success: false, error: "Otp expired" });
          } else {
            await Otp.deleteOne({ phone });
            const phoneToken = generatePhoneToken(phone);
            callback({ success: true, phoneToken });
          }
        }
      } catch (error) {
        callback({ success: false, error: "Error in otp verification" });
      }
    });

    socket.on("clear all existing otps ", async (data) => {
      try {
        const { phone } = data;
        await Otp.deleteMany({ phone: phone });
      } catch (error) {}
    });

    socket.on(
      "trigger otp request for password reset",
      async (data, callback) => {
        try {
          const { phone } = data;
          const user = await User.findOne({ phone: phone });
          if (!user) {
            callback({ success: false, error: "Phone number not found" });
          } else {
            const otp = generateOtp();
            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 5);
            const otps = await Otp.find({ phone: phone });
            if (otps) {
              await Otp.deleteMany({ phone: phone });
            }
            // await twilioClient.messages.create({
            //   body: `${otp} is your One-Time Password for Ventasia\nIt is valid for 5 minutes\nThank you.`,
            //   from: TWILIO_PHONE_NUMBER,
            //   to: `+91${phone}`,
            // });
            await Otp.create({
              phone,
              otp,
              expiry,
            });
            callback({ success: true, otp });
          }
        } catch (error) {
          callback({ success: false, error: "Error in otp verification" });
        }
      }
    );
  });
};

server.listen(SOCKET_PORT);

module.exports = { mobileOtpVerificationSocket };
