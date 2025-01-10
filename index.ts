import express from 'express'
import { connectDB } from './src/configs/db';
import cors from 'cors'
import { Request, Response } from "express";
import articleRoute from "./src/routes/articleRoute"
import userRoute from "./src/routes/userRoute"
import commentRoute from "./src/routes/commentRoute"
const PORT = 8000;
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRoute);
app.use("/api/article", articleRoute);
app.use("/api/comment", commentRoute);
app.use("/", (req: Request, res: Response) => {
  res.send(`${req.method} Route ${req.path} not found !`);
});
app.listen(PORT, () => {
  console.log(`server run on port ${PORT} ✅`);
});
