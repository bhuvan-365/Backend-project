import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/apiError.js"
import {User} from '../models/user.model.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';
import { ApiResponse} from '../utils/apiResponse.js';



const registerUser = asyncHandler(async (req, res) => {
// return res.status(200).json({
//     message:"ok its working"
// })

//get user data from req body (frontend)
//validation {format, required fields, unique email etc.} - not empty fields
// check if user already exists : username , email
// check for images 
// check for avatar
// upload image to cloudinary , avatar
// create user object - creation call  -entry in db
// remove password and refresh token from response
//check for errors 
// return response

const {fullName, username, email, password} = req.body || {};

console.log("email :", email);
// if(fullName=="" ){
//     throw new ApiError(400, "Full name is required");
// }

if([email, username ,password, fullName].some((field)=>field?.trim()===""))
    {
 throw new ApiError(400, "All fields are required");
 }

const existedUser = await User.findOne({
    $or:[{ email },{ username }]
})

if(existedUser){
    throw new ApiError(409, "User with given email or username already exists");
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400, "Avatar image is required");
}

const avatar = await uploadToCloudinary(avatarLocalPath)
const coverImage = await uploadToCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(500, "Unable to upload avatar image , please try again later");
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password
})

const createdUser =await User.findById(user._id).select(
    "-password -refreshTokens"
)

if(!createdUser){
    throw new ApiError(500, "Unable to create user , please try again later");
}



return res.status(201).json(

new ApiResponse(200, createdUser, "User registered successfully")

)
})
export {
    registerUser
}

