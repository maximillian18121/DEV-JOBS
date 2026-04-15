import { createJobs } from "../controllers/jobController.js";
import express from "express";

const jobRouter = express.Router();

jobRouter.post("/create", createJobs);


export default jobRouter;

