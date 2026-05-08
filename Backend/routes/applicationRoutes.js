import express from 'express';
import { createApplication, getApplicationFromJob, getApplicationFromMe, updateApplicationById, getApplicationById } from '../controllers/applicationController.js';
import { auth } from '../middlewares/auth.middleware.js';
import { logoUpload } from '../middlewares/uploadFileUtils.js';

const applicationRouter = express.Router();

applicationRouter.post("/apply/:id", auth, logoUpload.single('resume'), createApplication);
applicationRouter.get("/jobs/apply/:id", getApplicationFromJob);
applicationRouter.get("/mine", auth, getApplicationFromMe);
applicationRouter.patch("/:id/:status", auth, updateApplicationById);
applicationRouter.get("/:id", getApplicationById);

export default applicationRouter;