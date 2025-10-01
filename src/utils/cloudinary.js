import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudUpLoad = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //uploading the file
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //File uploaded successfully
    //console.log("The file has been uploaded successfully", result.url);
    fs.unlinkSync(localFilePath)
    return result;
  } catch (error) {
    console.log("There is an error in uploading the file",error);
    fs.unlinkSync(localFilePath); //remove the locally saved temp file as the upload operation is failed
    return null;
  }
};

export default cloudUpLoad;
