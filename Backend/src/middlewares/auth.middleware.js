import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const verifyToken = (req,res,next)=>{
    const token = req.cookies?.token;

    // console.log(token);

    if(!token){
        throw new ApiError(401, "No Existing Session Found")
    }
    //token exists :
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        // console.log(decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Error in Verification ",error)
        throw new ApiError(500, "Error Occured while validation of tokens")
    }
}