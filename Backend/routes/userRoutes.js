import express from "express";
import { demoController, register, login } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.get("/auth",demoController);
userRouter.post("/auth/register",register);
userRouter.post("/auth/login",login);


export default userRouter;