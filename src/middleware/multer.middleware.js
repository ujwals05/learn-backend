import multer from "multer";
import path from "path"
import fs from "fs"
//This is the offical doc code to store the file in the diskStroage, The file can also be stored in the memory storage

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "/tmp/my-uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// const upload = multer({ storage: storage });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../../public/temp");
//   },
//   filename: function (req, file, cb) {
//     //For now the suffix is removed 
//     cb(null, file.originalname); //file.'---' This will have many field for temp' we will keep the original name given by the user itself
//   },
// });

const uploadPath = path.join(process.cwd(), "public/temp");

// ensure the folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


export const upload = multer({ storage });


//This middleware will provide .files OR .file , We can use this using "req.file" . Basically we will using the path which we get here 
//In the same way auth middlware will provide .user we can use that by using req.user