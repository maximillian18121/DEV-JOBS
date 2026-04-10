import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import userRouter from "./routes/userRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);

app.listen(process.env.DB_PORT, ()=>{
    console.log("Server is running on port 5500");
})

