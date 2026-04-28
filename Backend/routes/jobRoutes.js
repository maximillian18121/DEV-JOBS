import { createJobs, getAllJobs, getJobById, updateJobById, deleteJob } from "../controllers/jobController.js";
import express from "express";
import { auth } from "../middlewares/auth.middleware.js";

const jobRouter = express.Router();

jobRouter.post("/create",auth, createJobs);
jobRouter.get("/", getAllJobs);
jobRouter.get("/:id",auth, getJobById);
jobRouter.patch("/:id", auth, updateJobById);
jobRouter.delete("/:id",auth, deleteJob);




export default jobRouter;

