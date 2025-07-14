import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { HR } from "../models/hr.model.js";

const registerHR = asyncHandler(async(req,res)=>{
    const {name, email, password, companyName} = req.body;

    if(!name || !email || !password || !companyName){
        throw new ApiError(400, "All Fields are Required")
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds);

        //check for existing HR
        const existingHR = await HR.findOne({email})

        if(existingHR){
            throw new ApiError(400, "HR Already Exists");
        }
        //adding to db
        const addHR = await HR.create({
            name,
            email,
            password:hashedPassword,
            companyName
        });

        // console.log("ADD HR OBJECT ",addHR);

        const retHR = await HR.findById(addHR._id).select("-password")

        if(!retHR){
                throw new ApiError(500, "Can't Process the HR in our database");
        }
            
        return res.status(201).json(
            new ApiResponse(201, retHR, "HR Registered Successfully")
        )
        
    } catch (error) {
        console.log("Error : ", error);
        throw new ApiError(500, "Can't Process the Operation")
    }
});

const loginHR = asyncHandler(async(req,res)=>{

    const {email, password} = req.body;
    if(!email || !password){
        throw new ApiError(400,"Both Email & Password Required")
    }

    try {

        const possibleUser = await HR.findOne({email});
        if(!possibleUser){
            throw new ApiError(404, "No Such User Exists");
        }
        // console.log("USER ",possibleUser)

        const passwordCheck = await bcrypt.compare(password, possibleUser.password);
        if(!passwordCheck){
            throw new ApiError(401, "Invalid User Credentials")
        }

        const LoggedInUser = await HR.findById(possibleUser._id).select("-password");

        const token = jwt.sign({_id:possibleUser._id, email:possibleUser.email, name:possibleUser.name},process.env.JWT_SECRET,{expiresIn: '1d',});

        const options = {
        httpOnly: true,
        secure: true
        }

        return res.status(200)
        .cookie('token',token,options)
        .json(new ApiResponse(200, LoggedInUser, "User Logged In Successfully"))
        
    } catch (error) {
        console.log("Error : ", error);
        throw new ApiError(500, "Can't Login User")
    }
});

const logoutHR = asyncHandler(async(req,res)=>{
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200,{},"User Logged Out"))
});

export {registerHR, loginHR, logoutHR}