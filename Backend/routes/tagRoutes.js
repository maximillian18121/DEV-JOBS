import express from 'express';
import { createTags, getAllTags } from '../controllers/tagController.js';
import { auth } from '../middlewares/auth.middleware.js';

const tagRouter = express.Router();

tagRouter.post("/create", auth, createTags);
tagRouter.get("/",auth,getAllTags);

export default tagRouter;