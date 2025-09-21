import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({
  path: "../../.env",
});

cloudinary.config({
  cloud_name: "dd1ekyjzx",
  api_key: "951825667921159",
  api_secret: "uB9Wh5_KCTISr9sLh18sEFPDMGc",
});

const cloudUpLoad = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //uploading the file
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //File uploaded successfully
    console.log("The file has been uploaded successfully", result.url);
    return result;
  } catch (error) {
    console.log("There is an error in uploading the file",error);
    fs.unlinkSync(localFilePath); //remove the locally saved temp file as the upload operation is failed
    return null;
  }
};

export default cloudUpLoad;
