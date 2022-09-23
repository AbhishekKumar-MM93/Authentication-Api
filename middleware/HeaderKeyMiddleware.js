import asyncHandler from "express-async-handler";
import { Validator } from "node-input-validator";
import { checkValidation, error, failed } from "../helper.js";
import jwt from "jsonwebtoken";
import User from "../models/RegisterUserModel.js";

export const checkHeadersKey = async (req, res, next) => {
  let v = new Validator(req.headers, {
    secret_key: "required|string",
    publish_key: "required|string",
  });
  let errorsResponse = await checkValidation(v);
  if (errorsResponse) {
    return failed(res, errorsResponse);
  }

  if (
    req.headers.secret_key !== process.env.HEADER_SECRET_KEY ||
    req.headers.publish_key !== process.env.HEADER_PUBLISH_KEY
  ) {
    return failed(res, "Keys Do Not Matched");
  }
  next();
};

export const jwtAuth = asyncHandler(async (req, res, next) => {
  console.log(process.env.JWT_SECRET_KEY);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      let token = req.headers.authorization.split(" ")[1];

      let result = await jwt.verify(token, process.env.JWT_SECRET_KEY);

      let checkUser = await User.findOne({
        _id: result.id,
        logintime: result.iat,
      });

      if (checkUser) {
        req.user = checkUser;
        next();
      }
    } catch (err) {
      res.status(400).json(err);
    }
  } else {
    res.status(401).json("Not Authorized, No token, Need to Re-Login");
  }
});
