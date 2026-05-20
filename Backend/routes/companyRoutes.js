import express from "express";
import db from "../models/index.js";
import {
  createCompany,
  updateCompany,
  getCompanyProfile,
  updateCompanyLogo,
} from "../controllers/companyController.js";
import { logoUpload } from "../middlewares/uploadFileUtils.js";
import { auth, checkOwnerShip } from "../middlewares/auth.middleware.js";

const company = db.Companies;
const companyRouter = express.Router();

companyRouter.post("/create", auth, logoUpload.single("logo"), createCompany);
companyRouter.get("/:id", getCompanyProfile);
companyRouter.patch(
  "/:id",
  auth,
  checkOwnerShip(company, "id", "owner_id"),
  updateCompany,
);
companyRouter.post(
  ":id/logo",
  auth,
  checkOwnerShip(company, "id", "owner_id"),
  logoUpload.single("logo"),
  updateCompanyLogo,
);

export default companyRouter;
