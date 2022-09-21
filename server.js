import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import connectDB from "./connectdb.js";
import userRouter from "./Route/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
app.use(express.json());
dotenv.config();

connectDB();

app.use("/api", userRouter);

app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 9111;
app.listen(PORT, () => {
  console.log(`server Running on ${PORT}`.bgMagenta.bold);
});
