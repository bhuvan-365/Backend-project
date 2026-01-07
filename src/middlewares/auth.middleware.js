import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';


export const verifyJWT = asyncHandler(async (req, res, next) => {

try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.repalce("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "You are not logged in, please login to access this resource");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshTokens")
        if (!user) {
            throw new ApiError(401, "The user belonging to this token no longer exists")
        }
    
        req.user = user;
        next();
} catch (error) {
 throw new ApiError(401, error?.message|| "Invalid token or token has expired");
}


}); 