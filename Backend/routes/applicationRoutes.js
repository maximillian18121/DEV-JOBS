import express from 'express';
import { createApplication } from '../controllers/applicationController.js';
import { auth } from '../middlewares/auth.middleware.js';
import { logoUpload } from '../middlewares/uploadFileUtils.js';

const applicationRouter = express.Router();

applicationRouter.post("/apply/:id", auth, logoUpload.single('resume'), createApplication);

export default applicationRouter;