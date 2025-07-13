import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const meRoute = asyncHandler((req,res)=>{
    if(!req.user){
        throw new ApiError(400, "Unauthorized access")
    }
    const user = req.user;
    return res.status(200)
    .json(new ApiResponse(200,{user},"User Session Exists"))
})

export {meRoute}