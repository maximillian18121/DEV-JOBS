import express from "express";
import { demoController, register, login, refreshToken } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.get("/auth",demoController);
userRouter.post("/auth/register",register);
userRouter.post("/auth/login",login);
userRouter.post("/auth/refresh_token",refreshToken);


export default userRouter;