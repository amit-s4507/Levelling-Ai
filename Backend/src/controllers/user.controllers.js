import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import fs from "fs"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save( { validateBeforeSave : false } )

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and referesh token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    const {fullName, email, username, password} = req.body

    // Validation - check if fields are empty
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields are required")
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // Handle file uploads
    let avatarLocalPath;
    let coverImageLocalPath;
    
    try {
        // Handle avatar upload
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path;
        }

        // Handle cover image upload
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        // If no avatar is uploaded, use a default avatar URL
        let avatarUrl = "https://res.cloudinary.com/drc4tsoab/image/upload/v1709067374/default_avatar.png";
        
        // If avatar is uploaded, try to upload it to cloudinary
        if (avatarLocalPath) {
            try {
                const avatar = await uploadOnCloudinary(avatarLocalPath);
                if (avatar) {
                    avatarUrl = avatar.url;
                }
            } catch (uploadError) {
                console.error("Avatar upload error:", uploadError);
                // Continue with default avatar
            }
        }

        // Handle cover image upload
        let coverImageUrl = "";
        if (coverImageLocalPath) {
            try {
                const coverImage = await uploadOnCloudinary(coverImageLocalPath);
                if (coverImage) {
                    coverImageUrl = coverImage.url;
                }
            } catch (uploadError) {
                console.error("Cover image upload error:", uploadError);
                // Continue without cover image
            }
        }

        // Create user
        const user = await User.create({
            fullName,
            avatar: avatarUrl,
            coverImage: coverImageUrl || "",
            email,
            password,
            username: username.toLowerCase()
        });

        // Get created user without sensitive fields
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        );
    } catch (error) {
        // Clean up any uploaded files if registration fails
        try {
            if (avatarLocalPath && fs.existsSync(avatarLocalPath)) {
                fs.unlinkSync(avatarLocalPath);
            }
            if (coverImageLocalPath && fs.existsSync(coverImageLocalPath)) {
                fs.unlinkSync(coverImageLocalPath);
            }
        } catch (cleanupError) {
            console.error("Error cleaning up files:", cleanupError);
        }

        // Re-throw the original error
        throw error;
    }
})

const loginUser = asyncHandler(async (req,res) => {

    // reqbody -> Data
    // username or email 
    // find the user
    // password check
    // access and refresh token
    //send cookies 
    

    const {email, username , password } = req.body

    if((!username && !email)){
        throw new ApiError(400,"username and email is required");
    }

   const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordVslid = await user.isPasswordCorrect(password)

    if(!isPasswordVslid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken                
            },
            "User logged In Successfully "
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : 1, // this removes the field from document 
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

const refreshAccessToken = asyncHandler(async(req,res) =>{

    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

    if( ! incomingRefreshToken ) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
    
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if( !user ){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used ")
        }
    
        const options = {
            httpOnly : true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
              200,
              {accessToken,refreshToken : newRefreshToken},
              "Access token refreshed "  
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})
 
const changeCurrentPassword = asyncHandler(async(req,res) =>{

    const {oldPassword, newPassword} = req.body

    // req.user?.id
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200), {}, "Password Changed Successfully")
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req,res) =>{

    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email : email,
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))


})


const updateUserAvatar = asyncHandler(async(req,res) =>
 {
   const avatarLocalPath = req.file?.path

   if ( !avatarLocalPath ) {
        throw new ApiError(400, "Avatar file is missing ")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
   }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res.status(200)
    .json(
      new ApiResponse(200,user, "Avatar image updated successfully")  
    )
 })

 const updateCoverImage = asyncHandler(async(req,res) =>
 {
   const coverImageLocalPath = req.file?.path

   if ( ! coverImageLocalPath ) {
        throw new ApiError(400, "coverImage file is missing ")
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on coverImage")
   }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res.status(200)
    .json(
      new ApiResponse(200,user, "Cover image updated successfully")  
    )
 })

 const getUserChannelProfile = asyncHandler(async(req,res) =>
 {

    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
    {
        $match : {
            username : username?.toLowerCase()
        }
    },
    {
        $lookup :  {
            from : "subscriptions", // automatically convert ho jata n lowercase aur pural me 
            localField : "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from : "subscriptions",  
            localField : "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    },
    {
        $addFields : {
            subscribersCount :{
                $size : "$subscribers"
            },
            channelsSubscribedToCount : {
                $size : "$subscribedTo"
            },
            isSubscribed : {
                $cond : {
                    if : {$in : [req.user?._id, "$subscribers.subscriber"]},
                    then : true,
                    else : false,
                }
            }
        }
    },
    {
        $project : {
            fullName : 1,
            username : 1,
            subscribersCount : 1,
            channelsSubscribedToCount : 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1


        }
    }

    ])

    if(!channel?.length){
        throw new ApiError(404, "channel does not exists ")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0] , "User channel fetched successfully")
    )
 })

 const getWatchHistory = asyncHandler(async(req,res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from : "videos",
                localField : "watchHistory",
                foreignField: "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as : "owner",

                            pipeline: [
                              {
                                $project: {
                                    fullName : 1,
                                    username : 1,
                                    avatar : 1,
                                }
                              }  
                            ]

                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
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
        new ApiResponse(
            200,
            user[0].watchHistory  || [],
            "Watch history fetched successfully"
        )
    )
 })

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword ,
    getCurrentUser,
    updateAccountDetails ,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
    
}