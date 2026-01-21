import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/apiError.js"
import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshTokens = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (err) {
        throw new ApiError(500, "Token generation failed");
    }
}

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

    const { fullName, username, email, password } = req.body;

    console.log("email :", email);
    // if(fullName=="" ){
    //     throw new ApiError(400, "Full name is required");
    // }

    if ([email, username, password, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with given email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!avatar) {
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

    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )

    if (!createdUser) {
        throw new ApiError(500, "Unable to create user , please try again later");
    }



    return res.status(201).json(

        new ApiResponse(200, createdUser, "User registered successfully")

    )
})

const loginUser = asyncHandler(async (req, res) => {

    //bring data from req body
    // username , email
    // find the user in db
    // password check
    // access token , refresh token generate and send to user
    // send cookies

    const { email, password, username } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email are required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    }).then(async (user) => {
        if (!user) {
            throw new ApiError(404, "User not found with given credentials");
        }

        const ispasswordValid = await user.ispasswordValid(password)
        if (!ispasswordValid) {
            throw new ApiError(401, "Password incorrect");
        }

        return user;
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshTokens")

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken

                }, "User logged in successfully")
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshTokens: 1
            // this removes the field from document
            }
        },
        {
            new: true

        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"))


})

const refreshAccessToken = asyncHandler(async (req, res) => {


    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request");
    }
    try {

        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(400, "inVAlid refresh token ");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(400, "Refresh token expired or used ");
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    { accessToken, resfreshToken: newRefreshToken }
                    , "Access token refreshed successfully"
                ))
    } catch (error) {
        throw new ApiError(400, error?.email || "Error in invalid refresh token ");
    }

});

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.ispasswordValid(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed sucessfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(200, req.user, "current user  fetched sucessfully ")
})

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { fullName, email, } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "all field required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }

        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated sucessfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar misssing")

    }
    const avatar = await uploadToCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "error while uploading")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }

        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar uploaded sucessfully")
        )

})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImageLocalPath misssing")

    }
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }

        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "coverImage uploaded sucessfully")
        )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username missing ")
    }

    // User.find({username})

    const channel = await User.aggregate([

        {
            $match: {
                username: username?.toLowerCase()
            },
        },
            {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscriber"
            }
            },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriberTo"
            }
        },
        {

            $addFields:{
                subscribersCount:{
                    $size:"$subscriber"
                },
                channelsSubscribedToCount:{
                    $size:"$subscriberTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"subscribers.subscriber"]},
                        //$in looks for both object and array , but rightnow we use object
                        then:true,
                        else:false

                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
                createdAt:1,

            }
        }


   ])
   console.log(channel)

if(!channel?.length){
    throw new ApiError(400, "channel does not exist")
}
return res
.status(200)
.json(
    new ApiResponse(200,channel[0],"User channel fetched sucessfully")
)

})

const getWatchHistory = asyncHandler(async(req,res)=>{

    const user = await User.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id) 
            }
        },
        {
            $lookup:{
                from:"videos",
                loacalField:"watchHistory",
                froreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreigField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        usernname:1,
                                        avatar:1
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch history fetched sucessfully")
    )

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory

}

