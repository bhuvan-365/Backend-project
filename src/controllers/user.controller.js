import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/apiError.js"
import {User} from '../models/user.model.js';


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

const {fullName, username, email, password} = req.body;

console.log("email :", email);
// if(fullName=="" ){
//     throw new ApiError(400, "Full name is required");
// }

if([email, username ,password, fullName].some((field)=>field?.trim()===""))
    {
 throw new ApiError(400, "All fields are required");
 }

const UserExist= User.findOne({
    $or:[{ email },{ username }]
})



})
export {
    registerUser
}

