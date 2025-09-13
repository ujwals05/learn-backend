import { APIError } from "../utils/apiError.js"
import { user } from "../models/user.model.js"
import cloudUpLoad from "../utils/cloudinary.js"
import { APIresponse } from "../utils/apiResponse.js"

export const registerUser = async (req,res,next) => {
  try {
    
    // 1.Get user details from frontend (For now from POSTMAN)
    const {username,email,password,fullname} = req.body
    //console.log("email",email,"username",username) - Checking whether is it working through POSTMAN


    // 2.Validation - Check for the empty field in the user entry
    // if(!username || !email || !password || !fullname)          'simple way to check for validation
    //   return res.status(400).json({message:"All field are required"});
    if(fullname ==="")
      throw new APIError(400,"The name has to be entered") //Same way write it for all the rest files


    // 3.Check if already user exists
    // const userExist = user.findOne({email})   'simple way to check whether the user exist or not 
    // if(userExist) return res.status(400).json({message:"User already exist"})
    const userExist = user.findOne({
      $or: [{username},{email}]
    })
    if(userExist){
      throw new APIError(409,"User already exists")
    }


    // 4.Check for avatar and the images
    const avatarLocalPath = req.files?.avatar[0]?.path     //This is step to take the file path of the locally stored file
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath){
      throw new APIError(400,"Avatar file is required")
    }


    // 5.Uploading to cloudinary
    const uploadAvatar = await cloudUpLoad(avatarLocalPath)
    const uploadCoverImage = await cloudUpLoad(coverImageLocalPath)

    if(!uploadAvatar)
       throw new APIError(400, "Cant able to upload avatar");
    

    // 6.Create a user object - create entry in DB
    const User = await user.create({
      username : username.toLowerCase(),
      fullname,
      email,
      password,
      avatar : uploadAvatar.url,
      coverImage : uploadCoverImage.url || " "

    })

    // 7.Remove password and refresh token from the response
    const createdUser = await user.findById(User._id).select("-password -refreshToken");

    
    // 8.Check whether user is created or not 
    if(!createdUser)
      throw new APIError(500,"Something went wrong while creating the user ")


    // 9.return res
    return res.status(201).json(
      new APIresponse("User registered Successfully",200,createdUser)
    )

  } catch (error) {
    console.log("ERROR OCCURES : ",error),
    res.status(500).json({
      message:"INTERNAL SERVER ERROR"
    })
  }
}

export const userLogin = async(req,res,next) =>{
  try {
    
  } catch (error) {
    console.log(error)
  }
}