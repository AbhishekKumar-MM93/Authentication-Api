import mongoose from "mongoose";

const User = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loginTime: { type: String, required: false },
});

export default new mongoose.model("RegisterUser", User);
