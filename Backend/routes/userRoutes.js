import express from "express";
import { demoController, register } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.get("/auth",demoController);
userRouter.post("/auth/register",register);


export default userRouter;