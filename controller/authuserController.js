import User from "../models/RegisterUserModel.js";
import asyncHandler from "express-async-handler";
import { Validator } from "node-input-validator";
import { checkValidation, error, failed, success } from "../helper.js";
import { decryption, encryption } from "../Uitils/cryptoAuth.js";
import {
  generateToken,
  generateTokenForOTP,
  verifyOtp,
} from "../Uitils/generateTokenJWT.js";
import nodemailer from "nodemailer";

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
    let Token = generateToken(userExsist._id); // every time generate when we login

    let info = {
      firstName: userExsist.firstName,
      lastName: userExsist.lastName,
      email: userExsist.email,
    };

    let password = decryption(userExsist.password);
    if (password === Values.inputs.password) {
      await User.updateOne(
        //here we update our login time
        { _id: userExsist._id },
        {
          $set: {
            loginTime: (await Token).time,
          },
        }
      );

      return success(res, "Logged in success", {
        ...info,
        token: (await Token).token,
        loginTime: (await Token).time,
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

const logoutUsers = asyncHandler(async (req, res) => {
  try {
    let user = await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          loginTime: 0,
        },
      }
    );
    if (user) {
      console.log(user);
      res.status(200);
      return success(res, "Logout successfuly");
    } else {
      return error(res, "please login first");
    }
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

      const result = await user.save();
      return success(res, "Updatern successfully", result);
    } catch (error) {
      return failed(res, error.message);
    }
  }
});

const updatedPassword = asyncHandler(async (req, res) => {
  const v = new Validator(req.body, {
    password: "string|required",
    newPassword: req.body.password ? "required|string" : "string",
  });

  const Values = JSON.parse(JSON.stringify(v));
  const errorsResponse = await checkValidation(v);
  if (errorsResponse) {
    return res, "Please check the info";
  }
  const ID = req.params.id;
  const user = await User.findById(ID);
  if (!user) {
    return error(res, "User Not Found");
  } else {
    let userPassword = decryption(user.password);
    if (req.body.password === userPassword) {
      user.password = encryption(req.body.newPassword);
      let result = await user.save();
      return success(res, "Passwod Updated Successfully");
    } else {
      return error(res, "Password do not match");
    }
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  try {
    const v = new Validator(req.body, {
      email: "required|email",
    });
    const Values = JSON.parse(JSON.stringify(v));
    const errorsResponse = await checkValidation(v);
    if (errorsResponse) {
      return failed(res, errorsResponse);
    }

    let userEmail = await User.findOne({ email: Values.inputs.email }).select(
      "email"
    );
    // console.log(user);
    if (!userEmail) failed(res, "User not found");

    var transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "009e11e446a131",
        pass: "eb3230625727ef",
      },
    });

    const otp = Math.floor(100000 + Math.random() * 1000000);
    const otpToken = generateTokenForOTP(otp);

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: "check@wwx.com ", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>Hello world? This is  testing mail </b> </br>
       <b> your otp is : ${otp} </br>  `, // html body
    });

    return success(res, "otp send successfully", otpToken);
  } catch (err) {
    error(res, err.message);
  }
});

const verifyOtpToken = asyncHandler(async (req, res) => {
  try {
    const v = new Validator(req.body, {
      otp: "required",
    });
    const Values = JSON.parse(JSON.stringify(v));
    const errorResponse = await checkValidation(v);

    if (errorResponse) return failed(res, errorResponse);

    const otpToken = req.headers.authorization.split(" ")[1];
    const { otp: Otp } = verifyOtp(otpToken);

    // console.log(Otp);

    if (Values.inputs.otp != Otp) {
      return failed(res, "Wrong Otp");
    } else {
      return success(res, "Otp Match");
    }
  } catch (err) {
    error(res, err.message);
  }
});

const updateForgotPassword = async (req, res) => {
  try {
    const v = new Validator(req.body, {
      newPassword: "required",
      confirmNewPassword: "required",
    });
    const Values = JSON.parse(JSON.stringify(v));
    const errorResponse = await checkValidation(v);
    if (errorResponse) return failed(res, errorResponse);

    const v1 = new Validator(req.params, {
      email: "required|email",
    });
    const Values1 = JSON.parse(JSON.stringify(v1));
    const errorResponse1 = await checkValidation(v1);
    if (errorResponse1) return failed(res, errorResponse1);

    let user = await User.findOne({ email: Values1.inputs.email });
    if (!user) return failed(res, "Email doesn't Exsist or wrong email");

    if (Values.inputs.newPassword != Values.inputs.confirmNewPassword) {
      return failed(res, "password do not match please check the password");
    } else {
      const password = encryption(Values.inputs.confirmNewPassword);
      console.log(password, "-------password------");
      var updatedPass = await User.findOneAndUpdate(
        { email: req.params.email },
        {
          password: password,
        }
      );
    }
    console.log(updatedPass, "---------updatedPass----------");
    if (updatedPass) {
      return success(res, "Password Updated Successfully", updatedPass);
    } else {
      return failed(res, "Password Not update");
    }
  } catch (err) {
    return error(res, err.message);
  }
};

export {
  createUser,
  getAllUsers,
  loginUser,
  updateUserInfo,
  logoutUsers,
  updatedPassword,
  forgetPassword,
  verifyOtpToken,
  updateForgotPassword,
};

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
