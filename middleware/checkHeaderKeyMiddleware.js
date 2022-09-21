import asyncHandler from "express-async-handler";
import { Validator } from "node-input-validator";
import { checkValidation, failed } from "../helper.js";

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
