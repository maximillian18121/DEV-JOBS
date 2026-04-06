import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";


const app = express();

app.use(cors());
app.use(express.json());

app.listen(process.env.DB_PORT, ()=>{
    console.log("Server is running on port 5500");
})

