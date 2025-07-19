import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { HR } from "../models/hr.model.js";
import { JobDescription } from "../models/jobDescription.model.js";
import { Applicant } from "../models/applicant.model.js";

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

const getProfile = asyncHandler(async(req, res) => {
    const { _id } = req.user;

    if (!_id) {
        throw new ApiError(401, "Unauthorized access");
    }

    try {
        const user = await HR.findById(_id).select("-password");
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, { user }, "Profile retrieved successfully")
        );
    } catch (error) {
        console.log("Error fetching profile:", error);
        throw new ApiError(500, "Failed to fetch profile");
    }
});

const changePassword = asyncHandler(async(req, res) => {
    const { _id } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters long");
    }

    try {
        const user = await HR.findById(_id);
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isCurrentPasswordValid) {
            throw new ApiError(401, "Current password is incorrect");
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await HR.findByIdAndUpdate(_id, { password: hashedNewPassword });

        return res.status(200).json(
            new ApiResponse(200, {}, "Password changed successfully")
        );
    } catch (error) {
        console.log("Error changing password:", error);
        throw new ApiError(500, "Failed to change password");
    }
});

const getDashboardStats = asyncHandler(async(req, res) => {
    const { _id: hrId } = req.user;
    
    if (!hrId) {
        throw new ApiError(401, "You must be signed in first");
    }

    try {
        // Get total jobs posted by this HR
        const totalJobs = await JobDescription.countDocuments({ createdBy: hrId });

        // Get all job IDs created by this HR
        const hrJobs = await JobDescription.find({ createdBy: hrId }).select('_id');
        const hrJobIds = hrJobs.map(job => job._id);

        // Get total applicants for HR's jobs
        const totalApplicants = await Applicant.countDocuments({ 
            jobApplied: { $in: hrJobIds } 
        });

        // Get total interviews scheduled (Interview1_Scheduled + Interview2_Scheduled + Interview1_Cleared + Interview2_Cleared)
        const totalInterviews = await Applicant.countDocuments({
            jobApplied: { $in: hrJobIds },
            status: { 
                $in: ['Interview1_Scheduled', 'Interview2_Scheduled', 'Interview1_Cleared', 'Interview2_Cleared', 'Selected'] 
            }
        });

        // Get candidates selected/onboarded
        const totalSelected = await Applicant.countDocuments({
            jobApplied: { $in: hrJobIds },
            status: 'Selected'
        });

        // Get recent jobs with applicant counts
        const recentJobs = await JobDescription.find({ createdBy: hrId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Add applicant count for each job
        for (let job of recentJobs) {
            const applicantCount = await Applicant.countDocuments({ jobApplied: job._id });
            const interviewCount = await Applicant.countDocuments({
                jobApplied: job._id,
                status: { 
                    $in: ['Interview1_Scheduled', 'Interview2_Scheduled', 'Interview1_Cleared', 'Interview2_Cleared', 'Selected'] 
                }
            });
            job.applicantCount = applicantCount;
            job.interviewCount = interviewCount;
        }

        return res.status(200).json(
            new ApiResponse(200, {
                stats: {
                    totalJobs,
                    totalApplicants,
                    totalInterviews,
                    totalSelected
                },
                recentJobs
            }, "Dashboard stats retrieved successfully")
        );

    } catch (error) {
        console.log("Error getting dashboard stats:", error);
        throw new ApiError(500, "Failed to retrieve dashboard statistics");
    }
});

export {registerHR, loginHR, logoutHR, getProfile, changePassword, getDashboardStats}