import express from "express";
import db from "../models/index.js";
import { createCompany, updateCompany } from "../controllers/companyController.js";
import { logoUpload } from "../middlewares/uploadFileUtils.js";
import { auth } from "../middlewares/auth.middleware.js";

const company = db.Companies;
const companyRouter = express.Router();

companyRouter.post("/create", auth , logoUpload.single("logo") ,createCompany);
companyRouter.patch("/:id", auth, checkOwnerShip(company, "id", "owner_id") );


export default companyRouter;