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

export const videoPublish = async (req, res) => {
  try {
    //1.Get video id from params
    const { videoId } = req.params;

    const userInfo = req.user; //Checking for user logged in or not
    if (!userInfo) {
      throw new APIError(400, "Login required");
    }

    //2.Find the video details in database
    const Video = await video.findOne(videoId);

    if (!Video) {
      throw new APIError(400, "Cannot find the video in the database");
    }

    //3. Check for authorization
    if (Video?.owner.toString() !== req.user?._id.toString()) {
      throw new APIError(400, "Unauthorized");
    }

    //4. If published make it unpublish else make it publish
    Video.isPublished = !Video.isPublished;

    //5. Save the info in the database
    await Video.save();

    return res
      .status(200)
      .json(
        200,
        {},
        `Video is ${Video.isPublished ? "Published" : "Unpublished"}`,
      );
  } catch (error) {
    throw new APIError(400, error?.message || "Cannot publish video");
  }
};

export const videoLikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userInfo = req.user;

    const Video = video.findById(videoId);
    if (!Video) {
      throw new APIError(400, "Cannot find the Video");
    }

    if (!userInfo) {
      throw new APIError("Cannot like the video");
    }

    Video.likes = (Video.likes || 0) + 1;

    await Video.save();

    return res
      .status(200)
      .json(
        new APIresponse(
          200,
          { videoId, likes: Video.likes },
          "Video is liked",
        ),
      );
  } catch (error) {
    throw new APIError(400, error?.message || "Cannot get likes");
  }
};

export const videoViews = async (req, res) => {
  try {
    const videoId = req.params;
    const userInfo = req.user;
    if (!userInfo) {
      throw new APIError(400, "Login required");
    }
    const Video = await video.findByIdAndUpdate(
      videoId,
      {
        $inc: { views: 1 },
      },
      { new: true },
    );

    Video.save();

    return res
      .status(200)
      .json(
        new APIresponse(
          200,
          { videoId, views: Video.views },
          "Views fetched successfully",
          true,
        ),
      );
  } catch (error) {
    throw new APIError(400, error?.message || "Can't increase video views");
  }
};
