import { APIError } from "../utils/apiError.js";
import { user } from "../models/user.model.js";
import cloudUpLoad from "../utils/cloudinary.js";
import { APIresponse } from "../utils/apiResponse.js";

const generateAccessRefreshToken = async (userID) => {
  const User = await user.findOne(userID);
  const accessToken = User.generateAccessToken();
  const refreshToken = User.generateRefreshToken();

  User.refreshToken = refreshToken; //Assiging the value in DB
  await User.save({ validateBeforeSave: false }); //Saving the data in DB without validation

  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    // 1.Get user details from frontend (For now from POSTMAN)
    const { username, email, password, fullname } = req.body;
    //console.log(req.body)
    //console.log("email",email,"username",username) - Checking whether is it working through POSTMAN

    // 2.Validation - Check for the empty field in the user entry
    // if(!username || !email || !password || !fullname)          'simple way to check for validation
    //   return res.status(400).json({message:"All field are required"});
    if (fullname === "") throw new APIError(400, "The name has to be entered"); //Same way write it for all the rest files

    // 3.Check if already user exists
    // const userExist = user.findOne({email})   'simple way to check whether the user exist or not
    // if(userExist) return res.status(400).json({message:"User already exist"})
    const userExist = await user.findOne({
      $or: [{ username }, { email }],
    });
    if (userExist) {
      throw new APIError(409, "User already exists");
    }

    // 4.Check for avatar and the images
    const avatarLocalPath = req.files?.avatar[0]?.path; //This is step to take the
    // file path of the locally stored file
    //console.log(req.files)
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
      throw new APIError(400, "Avatar file is required");
    }

    // 5.Uploading to cloudinary
    const uploadAvatar = await cloudUpLoad(avatarLocalPath);
    const uploadCoverImage = await cloudUpLoad(coverImageLocalPath);

    if (!uploadAvatar) throw new APIError(400, "Cant able to upload avatar");

    // 6.Create a user object - create entry in DB
    const User = await user.create({
      username: username.toLowerCase(),
      fullname,
      email,
      password,
      avatar: uploadAvatar.url,
      coverImage: uploadCoverImage.url || " ",
    });

    // 7.Remove password and refresh token from the response
    const createdUser = await user
      .findById(User._id)
      .select("-password -refreshToken");

    // 8.Check whether user is created or not
    if (!createdUser)
      throw new APIError(500, "Something went wrong while creating the user ");

    // 9.return res
    return res
      .status(201)
      .json(new APIresponse("User registered Successfully", 200, createdUser));
  } catch (error) {
    (console.log("ERROR OCCURES : ", error),
      res.status(500).json({
        message: "INTERNAL SERVER ERROR",
      }));
  }
};

export const loginUser = async (req, res) => {
  try {
    //1. Get the data
    const { email, username, password } = req.body;

    //Checking for all the field is filled
    if (!username || !email) {
      throw new APIError(400, "Enter username or email");
    }

    //2. Checking for whether user exist or not
    const User = await user.findOne({
      $or: [{ username }, { email }],
    });

    //If user not exist throw error
    if (!User) {
      throw new APIError(401, "User not found");
    }

    //3.Checking for correct password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new APIError(401, "Invalid creditinals ");
    }

    //4.Generating access and refresh token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      User._id,
    );

    const userLogin = await user
      .findOne(User._id)
      .select("-password -refreshToken");

    //5.Cookies for sending tokens:
    //This options is required : Because the cookies can be modified from the user end only
    const options = {
      httpOnly: true, //By doing this we can only handle cookies in the server side only
      secure: true,
    };

    //Sending cookies with response
    return res
      .status(200)
      .cookie("Access Token", accessToken, options)
      .cookie("Refresh Token", refreshToken, options)
      .json(
        new APIresponse(
          200,
          {
            user: username,
            refreshToken,
            accessToken,
          },
          "User logged in successfully",
        ),
      );
  } catch (error) {
    throw new APIError(404, "Error while login");
  }
};

export const logoutUser = async (req, res) => {
  try {
    //For writing logout user we should write middleware to get the data like userid or username
    user.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      },
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new APIresponse(200, {}, "User logged out successfully"));
  } catch (error) {
    throw new APIError(400, "User couldn't logout");
  }
};
