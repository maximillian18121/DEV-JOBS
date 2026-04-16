import express from "express";
import { createCompany } from "../controllers/companyController.js";
import { logoUpload } from "../middlewares/uploadFileUtils.js";
import { auth } from "../middlewares/auth.middleware.js";

const companyRouter = express.Router();

companyRouter.post("/create", auth , logoUpload.single("logo") ,createCompany);

export default companyRouter;