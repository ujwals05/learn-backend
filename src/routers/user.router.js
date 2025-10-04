import { Router } from "express";
import {
  logoutUser,
  registerUser,
  loginUser,
  refreshAccessToken,
  changePassword,
  currentUser,
  updateUser,
  updateAvatar,
  updateCoverImage,
  userChannelProfile,
  userWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRouter = Router();

//Implementing MULTER middleware
userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]), //upload. has many options like any 'any','array','field','none','single'
  registerUser,
);

userRouter.route("/login").post(loginUser);

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/change-password").patch(verifyJWT, changePassword);

userRouter.route("/current-user").get(verifyJWT, currentUser);

userRouter.route("/update-user").patch(verifyJWT, updateUser);

userRouter
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);

userRouter
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

userRouter.route("/c/:username").get(verifyJWT, userChannelProfile);

userRouter.route("/watch-history").get(verifyJWT, userWatchHistory);

export default userRouter;
