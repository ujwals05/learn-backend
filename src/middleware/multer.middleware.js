import multer from "multer";

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../../public/temp");
  },
  filename: function (req, file, cb) {
    //For now the suffix is removed 
    cb(null, file.originalname); //file.'---' This will have many field for temp' we will keep the original name given by the user itself
  },
});

export const upload = multer({ storage });
