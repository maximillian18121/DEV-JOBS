import { createJobs, getAllJobs } from "../controllers/jobController.js";
import express from "express";
import { auth } from "../middlewares/auth.middleware.js";

const jobRouter = express.Router();

jobRouter.post("/create",auth, createJobs);
jobRouter.get("/", getAllJobs);


export default jobRouter;

