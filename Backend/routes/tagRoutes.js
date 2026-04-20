import express from 'express';
import { createTags } from '../controllers/tagController.js';
import { auth } from '../middlewares/auth.middleware.js';

const tagRouter = express.Router();

tagRouter.post("/create", auth, createTags);

export default tagRouter;