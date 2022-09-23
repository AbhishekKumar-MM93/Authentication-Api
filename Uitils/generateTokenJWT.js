import jwt from "jsonwebtoken";
import { unixTimestamp } from "../helper.js";

const generateToken = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1m",
  });
  const time = unixTimestamp();
  return {
    token,
    time,
  };
};

const generateTokenForOTP = (otp) =>
  jwt.sign({ otp }, process.env.JWT_SECRET_KEY, { expiresIn: "1m" });

const verifyOtp = (token) => jwt.verify(token, process.env.JWT_SECRET_KEY);
export { generateToken, generateTokenForOTP, verifyOtp };
