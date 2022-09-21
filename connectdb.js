import mongoose from "mongoose";

async function connectDB() {
  try {
    let result = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to mongodb".bgWhite.bold);
  } catch (error) {
    console.log(error.message);
  }
}

export default connectDB;
