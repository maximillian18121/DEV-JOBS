import multer from "multer";
import path from 'path';

const storage = multer.diskStorage({
    destination: (req,file,cb)=> {
        cb(null, path.resolve("public","uploads","company-logos"));
    },
    filename:(req,file,cb)=> {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName  = `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
        cb(null, safeName)
    }
})

const logoUpload = multer({
    storage,
    limits:{fileSize : 4*1024*1024},
    fileFilter:(req,file,cb) => {
        const allowedTypes = ["image/png", "image/jpeg"];
        if(!allowedTypes.includes(file.mimetype)){
            return cb(new Error("Only PNG and JPG files are allowed"), false);
        }
        cb(null, true)
    }
})

export {logoUpload};