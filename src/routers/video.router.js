import { Router } from "express";
import { upload } from "../middleware/multer.middleware";
import { verifyJWT } from "../middleware/auth.middleware";
import { videoUpload } from "../controllers/video.controller";

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

export default videoRouter;
