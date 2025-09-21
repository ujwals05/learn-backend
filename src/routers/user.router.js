import { Router } from "express";
import { registerUser,userLogin } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

//Implementing MULTER middleware 
router.route('/register').post(
  upload.fields(
    [
      {
        name : "avatar",
        maxCount : 1
      },
      {
        name : "coverImage",
        maxCount:1
      }
    ]
  ),        //upload. has many options like any 'any','array','field','none','single'
  registerUser
)

router.route('/login').post(
  userLogin
)
export default router