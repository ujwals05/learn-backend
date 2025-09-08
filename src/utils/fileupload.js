import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
dotenv.config({
  path: "../../.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

try {
  (async function () {
    const result = await cloudinary.uploader.upload("kernel-krackers-logo.png");
    console.log(result);
    console.log("The file is successfully uploaded to the cloudinary")
  })();
} catch (error) {
  console.log(error);
}
