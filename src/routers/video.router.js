import { Router } from "express";
import { upload } from "../middleware/multer.middleware";
import { verifyJWT } from "../middleware/auth.middleware";
import {
  videoLikes,
  videoPublish,
  videoUpload,
  videoViews,
} from "../controllers/video.controller";

const videoRouter = Router();

videoRouter.route(
  "/upload-video",
  verifyJWT,
  upload.fields[
    ({
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    })
  ],
  videoUpload,
);
videoRouter.route("/:videoId/published", verifyJWT, videoPublish);

videoRouter.route("/:videoId/likes", verifyJWT, videoLikes);

videoRouter.route("/:videoId/views", verifyJWT, videoViews);


export default videoRouter;
