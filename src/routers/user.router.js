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

const router = Router();

//Implementing MULTER middleware
router.route("/register").post(
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

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").patch(verifyJWT, changePassword);

router.route("/current-user").get(verifyJWT, currentUser);

router.route("/update-user").patch(verifyJWT, updateUser);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(verifyJWT, userChannelProfile);

router.route("/watch-history").get(verifyJWT, userWatchHistory);

export default router;
