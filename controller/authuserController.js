import User from "../models/RegisterUserModel.js";
import asyncHandler from "express-async-handler";
import { Validator } from "node-input-validator";
import { checkValidation, failed, success } from "../helper.js";
import { decryption, encryption } from "../Uitils/cryptoAuth.js";
import generateToken from "../Uitils/generateTokenJWT.js";

const createUser = asyncHandler(async (req, res) => {
  let v = new Validator(req.body, {
    firstName: "required|string",
    lastName: "required|string",
    email: "required|email",
    password: "required",
  });
  const Values = JSON.parse(JSON.stringify(v));
  const errorsResponse = await checkValidation(v);
  if (errorsResponse) {
    return failed(res, errorsResponse);
  }

  const allReadyExsist = await User.findOne({ email: Values.inputs.email });

  if (allReadyExsist) {
    res.status(404);
    throw new Error("User all ready exsist");
  } else {
    const { firstName, lastName, email, password } = Values.inputs;
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: encryption(password),
    });
    if (!user) {
      res.status(400);
      throw new Error("Please check  the info");
    } else {
      res
        .status(201)
        .send({ success: "-------------USER CREATED-------------", user });
    }
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const v = new Validator(req.body, {
    email: "required|email",
    password: "required",
  });
  let Values = JSON.parse(JSON.stringify(v));
  let errorsResponse = await checkValidation(v);
  if (errorsResponse) {
    return failed(res, "please check the information");
  }
  let userExsist = await User.findOne({ email: Values.inputs.email });

  if (!userExsist) {
    throw new Error("Need to register first");
  } else {
    let Token = generateToken(userExsist._id);

    let info = {
      firstName: userExsist.firstName,
      lastName: userExsist.lastName,
      email: userExsist.email,
    };
    let password = decryption(userExsist.password);
    if (password === Values.inputs.password) {
      return success(res, "Logged in success", {
        ...info,
        token: (await Token).token,
        time: (await Token).loginTime,
      });
    } else {
      throw new Error("Invalid password or Email");
    }
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    let users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const updateUserInfo = asyncHandler(async (req, res) => {
  let user = await User.findByIdAndUpdate(req.params.id, req.body);
  if (!user) {
    res.status(400);
    throw new Error("User Not Found");
  } else {
    try {
      const v = new Validator(req.body, {
        firstName: "string",
        lastName: "string",
        email: "string|email",
        password: "string",
        newPassword: req.body.password ? "required|string" : "string",
      });

      const Values = JSON.parse(JSON.stringify(v));
      const errorsResponse = await checkValidation(v);
      if (errorsResponse) {
        return res, "Please check the info";
      }

      user.firstName = Values.inputs.firstName || user.firstName;
      user.lastName = Values.inputs.lastName || user.lastName;
      user.email = Values.inputs.email || user.email;
      if (req.body.password) {
        let decryptPassword = decryption(user.password);
        if (decryptPassword === req.body.password) {
          user.password = encryption(req.body.newPassword);
        } else {
          res.status(400);
          throw new Error("Entered Password is not correct");
        }
      }
      const result = await user.save();
      return success(res, "Updatern successfully", result);
    } catch (error) {
      return failed(res, error.message);
    }
  }
});

export { createUser, getAllUsers, loginUser, updateUserInfo };

// const updateUserInfo = asyncHandler(async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;
//   let user = await User.findByIdAndUpdate(req.params.id, {
//     firstName,
//     lastName,
//     email,
//     password,
//   });
//   if (user) {
//     res.json({
//       id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       password: user.password,
//     });
//   } else {
//     throw new Error("User Not Found");
//   }
// });

// const resetPassword = asyncHandler(async (req, res) => {
//   const v = new Validator(req.body, {
//     password: "required",
//     newPassword: "required",
//     confirmNewPassword: "required",
//   });
//   const Values = JSON.parse(JSON.stringify(v));
//   const errorsResponse = await checkValidation(v);
//   if (errorsResponse) {
//     return failed(res, "check the field's info");
//   }

//   const loginUserInfo = await User.findById(req.params.id);
//   let loginUserPassword = decryption(loginUserInfo.password);

//   if (loginUserPassword != Values.inputs.password) {
//     return failed(res, "password do not matched");
//   } else {
//     let newPassword = Values.inputs.newPassword;
//     let confirmNewPassword = Values.inputs.confirmNewPassword;

//     if (newPassword != confirmNewPassword) {
//       return failed(res, "New Generted password is Not matched");
//     } else {
//       loginUserPassword = encryption(confirmNewPassword);
//       const updatedPassword = await loginUserPassword.save();
//       res.status(200).send("Password Changern successFully", updatedPassword);
//     }
//   }
// });

// export const updateUser = expressAsyncHandler(async (req, res) => {
//   const ID = req.params.id;
//   const user = await User.findById(ID);
//   if (!user) {
//     return failed(res, "User not Found");
//   } else {
//     try {
//       const v = new Validator(req.body, {
//         firstName: "string",
//         lastName: "string",
//         email: "string|email",
//         password: "string",
//         newPassword: req.body.password ? "required|string" : "string",
//       });
//       const values = JSON.parse(JSON.stringify(v));
//       const errorResponse = await checkValidation(v);
//       if (errorResponse) {
//         return failed(res, errorResponse);
//       }

//       user.firstName = values.inputs.firstName || user.firstName;
//       user.lastName = values.inputs.lastName || user.lastName;
//       user.email = values.inputs.email || user.email;
//       if (req.body.password) {
//         const decryptPass = decryptPassword(user.password);
//         if (decryptPass === req.body.password) {
//           user.password = encryptPassword(req.body.newPassword);
//         } else {
//           return failed(res, "Please enter valid old password");
//         }
//       }
//       const result = await user.save();
//       return success(res, "Updatern successfully", {
//         firstName: result.firstName,
//         lastName: result.lastName,
//         email: result.email,
//       });
//     } catch (error) {
//       return failed(res, error.message);
//     }
//   }
// });
