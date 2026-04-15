import express from "express";
import { createCompany } from "../controllers/companyController";

const companyRouter = express.Router();

companyRouter.post("/create", createCompany);

export default companyRouter;