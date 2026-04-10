import express from "express";
import { demoController } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.get("/auth",demoController);


export default userRouter;