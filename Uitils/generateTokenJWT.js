import jwt from "jsonwebtoken";
import { unixTimestamp } from "../helper.js";

const generateToken = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1m",
  });
  const loginTime = unixTimestamp();
  return {
    token,
    loginTime,
  };
};

export default generateToken;
