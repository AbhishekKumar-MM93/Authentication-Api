import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
  updateUserInfo,
  logoutUsers,
  updatedPassword,
  forgetPassword,
  verifyOtpToken,
  updateForgotPassword,
} from "../controller/authuserController.js";
import { checkHeadersKey, jwtAuth } from "../middleware/HeaderKeyMiddleware.js";

const userRouter = express.Router();

//<.______________________POST REQ_________________________.>

userRouter.route("/create").post(checkHeadersKey, createUser);
userRouter.route("/login").post(checkHeadersKey, loginUser);
userRouter
  .route("/updatepassword/:id")
  .post(checkHeadersKey, jwtAuth, updatedPassword);
userRouter.route("/forgetPassword").post(checkHeadersKey, forgetPassword);
userRouter.route("/verifyotp").post(checkHeadersKey, verifyOtpToken);
userRouter
  .route("/setNewPassword/:email")
  .post(checkHeadersKey, updateForgotPassword);

//<.________________________GET REQ_____________________________.>
userRouter.route("/logout").get(checkHeadersKey, jwtAuth, logoutUsers);
userRouter.route("/getallusers").get(checkHeadersKey, jwtAuth, getAllUsers);

//<.________________________PUT REQ________________________.>
userRouter
  .route("/updateuser/:id")
  .put(checkHeadersKey, jwtAuth, updateUserInfo);

export default userRouter;
