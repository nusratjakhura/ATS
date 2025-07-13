import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt'
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

        console.log("ADD HR OBJECT ",addHR);

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
})

export {registerHR}