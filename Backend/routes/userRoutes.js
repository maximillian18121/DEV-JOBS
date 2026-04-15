import express from "express";
import {
  demoController,
  register,
  login,
  refreshToken,
  logout,
  getUserProfile,
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.get("/auth", demoController);
userRouter.post("/auth/register", register);
userRouter.post("/auth/login", login);
userRouter.post("/auth/refresh_token", refreshToken);
userRouter.post("/auth/logout", logout);
userRouter.get("/auth/me", auth, getUserProfile);

export default userRouter;
