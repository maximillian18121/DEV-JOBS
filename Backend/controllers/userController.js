import db from "../models/index.js";

const user = db.User;

const demoController = async(req,res) => {
    return res.status(200).json({message:"Hello from the first api"});
}


export {demoController};