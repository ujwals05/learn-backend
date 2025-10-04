import { APIError } from "../utils/apiError";
import { APIresponse } from "../utils/apiResponse";
import cloudUpLoad from "../utils/cloudinary";
import { video } from "../models/video.model";

export const videoUpload = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new APIError(400, "Cannot get user-id , Login to upload");
    }

    const { title, description, isPublished } = req.body;

    if (!(title || description)) {
      throw new APIError(400, "Title and description should be entered");
    }

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath) {
      throw new APIError(400, "Cannot find video local path");
    }

    const videoURL = await cloudUpLoad(videoLocalPath);
    const thumbnailURL = thumbnailLocalPath
      ? await cloudUpLoad(thumbnailLocalPath)
      : null;

    const newVideo = await video.create({
      title,
      description,
      videoFile: videoURL,
      thumbnail: thumbnailURL,
      duration: videoURL.duration,
      isPublished: isPublished ?? true,
      owner: req.user._id,
    });

    return res
      .status(200)
      .json(
        new APIresponse(200, newVideo, "Video uploaded successfully", true),
      );
  } catch (error) {
    throw new APIError(400, error?.message || "Problem while video upload");
  }
};
