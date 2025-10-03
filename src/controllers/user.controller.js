import { APIError } from "../utils/apiError.js";
import { user } from "../models/user.model.js";
import cloudUpLoad from "../utils/cloudinary.js";
import { APIresponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/subscription.model.js";

const generateAccessRefreshToken = async (userID) => {
  const User = await user.findById(userID);
  const accessToken = await User.generateAccessToken();
  const refreshToken = await User.generateRefreshToken();

  User.refreshToken = refreshToken; //Assiging the value in DB
  await User.save({ validateBeforeSave: false }); //Saving the data in DB without validation

  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    // 1.Get user details from frontend (For now from POSTMAN)
    const { username, email, password, fullname } = req.body;
    //console.log(req.body)
    //console.log("email",email,"username",username) // Checking whether is it working through POSTMAN

    // 2.Validation - Check for the empty field in the user entry
    // if(!username || !email || !password || !fullname)          //simple way to check for validation
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
      coverImageLocalPath = req.files?.coverImage[0].path; // "?" this is the optional chaining
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
    const { username, email, password } = req.body;

    //Checking for all the field is filled
    if (!(username || email)) {
      throw new APIError(400, "Enter username or email");
    }

    //2. Checking for whether user exist or not
    const findUser = await user.findOne({
      $or: [{ username }, { email }],
    });

    //If user not exist throw error
    if (!findUser) {
      throw new APIError(401, "User not found");
    }

    //3.Checking for correct password
    const isPasswordValid = await findUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new APIError(401, "Invalid creditinals ");
    }

    //4.Generating access and refresh token
    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      findUser._id,
    );

    const userLogin = await user
      .findOne(findUser._id)
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
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new APIresponse(
          "User logged in successfully",
          200,
          {
            refreshToken,
            accessToken,
            userLogin,
          },
          true,
        ),
      );
  } catch (error) {
    throw new APIError(404, error);
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
    throw new APIError(400, error?.message || "User couldn't logout");
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new APIError(401, "Unauthorized request");
    }

    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFERSH_TOKEN_SECRET,
    );

    const User = await user.findById(decodedRefreshToken?._id);

    if (!User) {
      throw new APIError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== User?.refreshToken) {
      throw new APIError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } = await generateAccessRefreshToken(
      User?._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new APIresponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed",
          true,
        ),
      );
  } catch (error) {
    throw new APIError(401, error?.message);
  }
};

//The below code is just for trail
// export const refreshAccessTokenId = async (req, res) => {
//   try {
//     const incomingCookie = req.user;
//     const userInfo = await user.findById(incomingCookie?._id);
//     if (!userInfo) {
//       throw new APIError(401, "Invalid user doesnt exist");
//     }
//     if (incomingCookie?.refreshToken !== userInfo.refreshToken) {
//       throw new APIError(401, "Refresh token has expired");
//     }

//     const { accessToken, refreshToken } = await generateAccessRefreshToken(
//       userInfo._id,
//     );
//     const options = {
//       httpOnly: true,
//       secure: true,
//     };
//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", refreshToken, options)
//       .json(
//         new APIresponse(
//           200,
//           {
//             accessToken,
//             refreshToken,
//           },
//           "Access token refreshed",
//           true,
//         ),
//       );
//   } catch (error) {
//     throw new APIError(400, error?.message || "Cannot refresh the token");
//   }
// };

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const User = await user.findById(req.user._id);

    const checkPassword = User.isPasswordCorrect(currentPassword);
    if (!checkPassword) {
      throw new APIError(400, "Incorrect password");
    }

    User.password = newPassword;
    await User.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new APIresponse(200, {}, "Password changes successfully", true));
  } catch (error) {
    throw new APIError(
      400,
      error?.message || "Problem while changing password",
    );
  }
};

export const currentUser = async (req, res) => {
  try {
    const userInfo = req.user;
    return res
      .status(200)
      .json(
        new APIresponse(200, { userInfo }, "The current user is displayed"),
      );
  } catch (error) {
    throw new APIError(400, "User not found");
  }
};

export const updateUser = async (req, res) => {
  try {
    const { fullname, email } = req.body;
    if (!(fullname || email)) {
      throw new APIError(400, "There should be no empty filed");
    }

    const User = await user
      .findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            fullname: fullname,
            email: email,
          },
        },
        { new: true },
      )
      .select("-password");

    return res
      .status(200)
      .json(new APIresponse(200, User, "User is updated successfully", true));
  } catch (error) {
    throw new APIError(400, error?.message || "Cannot update user");
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new APIError(400, "Cannot find local path of avatar");
    }

    const saveAvatar = await cloudUpLoad(avatarLocalPath);
    if (!saveAvatar.url) {
      throw new APIError(400, "Cannot get url of avatar");
    }

    const User = await user
      .findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            avatar: saveAvatar.url,
          },
        },
        { new: true },
      )
      .select("-password");

    return res
      .status(200)
      .json(
        new APIresponse(200, { User }, "Avatar updated successfully", true),
      );
  } catch (error) {
    throw new APIError(400, error?.message || "Couldnt update avatar");
  }
};

export const updateCoverImage = async (req, res) => {
  try {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
      throw new APIError(400, "Cannot find coverImage");
    }
    const uploadCoverImage = await cloudUpLoad(coverImageLocalPath);
    if (!uploadCoverImage.url) {
      throw new APIError(400, "Cannot find cover image url");
    }
    const User = await user
      .findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            coverImage: uploadCoverImage.url,
          },
        },
        { new: true },
      )
      .select("-password");

    return res
      .status(200)
      .json(
        new APIresponse(200, User, "Cover image updated successfully", true),
      );
  } catch (error) {
    throw new APIError(400, error?.message || "Cannot update cover image");
  }
};

//This below controller is bit advance part
//Aggregation pipeline has been written to display the user profile
export const userChannelProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username.trim()) {
      throw new APIError(400, "Cannot find username");
    }
    // const User = user.find({username})   This is done normally to find whether the user is present or not , But now we can do this in the aggreation pipeline
    const channel = await user.aggregate(
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscription",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscription",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribed",
        },
      },
      {
        $addField: {
          subscriberCount: {
            $size: "$subscribers",
          },
          subscribedCount: {
            $size: "$subscribed",
          },
          isSubscribed: {
            $in: [req.user?._id, "$subscribers.subscriber"],  //middleware should be used 
            then: true,
            else: false,
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          subscribedCount: 1,
          subscriberCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
        },
      },
    );

    if (!channel.length) {
      throw new APIError(400, "Cannot find the channel");
    }

    return res
      .status(200)
      .json(
        new APIresponse(
          200,
          channel[0],
          "User profile sent successfully",
          true,
        ),
      );
  } catch (error) {
    throw new APIError(400, error?.message || "Cannot get user profile");
  }
};

