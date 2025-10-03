import { user } from "../models/user.model.js";
import { APIError } from "../utils/apiError.js"
import jwt from "jsonwebtoken"

export const verifyJWT = async(req,_,next) => {
  try {
    const token = await req.cookies.accessToken || req.header("Authorization")?.replace ("Bearer ","") || req.body.accessToken
    if(!token){
      throw new APIError(404, "User is not Authorized ");
    }
    const decodedUser =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const User = await user.findById(decodedUser?._id).select("-password -refreshToken")

    if(!User){
      throw new APIError(404,"Invalid creditinal")
    }

    req.user = User
    next()

  } catch (error) {
    throw new APIError(401,error?.message || "Invalid access token")
  }
}

//This middelware will provide req.user Which can be further used to get the information about users