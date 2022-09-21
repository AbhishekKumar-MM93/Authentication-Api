import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
  updateUserInfo,
} from "../controller/authuserController.js";
import {
  checkHeadersKey,
  Authorization,
} from "../middleware/HeaderKeyMiddleware.js";

const userRouter = express.Router();

userRouter.route("/create").post(checkHeadersKey, createUser);
userRouter
  .route("/getallusers")
  .get(checkHeadersKey, Authorization, getAllUsers);
userRouter
  .route("/updateuser/:id")
  .put(checkHeadersKey, Authorization, updateUserInfo);
userRouter.route("/login").post(checkHeadersKey, loginUser);
userRouter.route("/resetpassword/:id").post(checkHeadersKey);

export default userRouter;
