import { JobDescription } from "../models/jobDescription.model.js";
import { Applicant } from "../models/applicant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    experience,
    location,
    qualification,
    salary,
    jobType
  } = req.body;
  const {_id} = req.user;
  if (
    !title ||
    !requiredSkills ||
    !experience ||
    !location ||
    !qualification || !salary || !jobType
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  try {
    // Parse requiredSkills from comma-separated string to array
    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills 
      : requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill);

    // Parse qualification from comma-separated string to array
    const qualificationArray = Array.isArray(qualification) 
      ? qualification 
      : qualification.split(',').map(qual => qual.trim()).filter(qual => qual);

    const newJob = await JobDescription.create({
      title,
      description: description || " ",
      requiredSkills: skillsArray,
      experienceRequired: experience,
      location,
      qualification: qualificationArray,
      createdBy:_id,
      salary,
      jobType
    });

    if (!newJob) {
      throw new ApiError(500, "Failed to create job posting");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newJob, "Job posted successfully"));
  } catch (error) {
    console.log("Error : ", error);
    throw new ApiError(500, "Can't process the request");
  }
});

const getJob = asyncHandler(async (req, res) => {
  try {
    // Get all jobs
    const jobs = await JobDescription.find({});

    return res.status(200)
    .json( new ApiResponse(200, jobs, "Jobs retrieved successfully"));

  } catch (error) {
    console.log("Error : ", error);
    throw new ApiError(500, "Can't retrieve job(s)");
  }
});

const getHrJobs = asyncHandler(async (req, res)=>{
  const {_id} = req.user
  //_id is HR's id
  if(!_id){
    throw new ApiError(400, "You Must be Signed in first")
  }
  try {
    // Find jobs created by this HR (not findById)
    const jobs = await JobDescription.find({createdBy: _id});

    return res.status(200)
    .json( new ApiResponse(200, {
      jobs,
      totalJobs: jobs.length
    }, "HR's jobs retrieved successfully"));

  } catch (error) {
    console.log("Can't Get HR's Jobs", error)
    throw new ApiError(500, "Server not responding")
  }
});

const getApplicants = asyncHandler(async(req,res)=>{
  const { id } = req.params; // Job ID from URL
  const { _id: hrId } = req.user; // HR's ID from user
  
  if(!hrId){
    throw new ApiError(401, "You must be signed in first");
  }
  
  if(!id){
    throw new ApiError(400, "Job ID is required");
  }

  try {
    // check if such job exists
    const job = await JobDescription.findById(id);
    
    if(!job){
      throw new ApiError(404, "Job not found");
    }
    
    if(job.createdBy.toString() !== hrId.toString()){
      throw new ApiError(403, "You can only view applicants for your own job postings");
    }

    const applicants = await Applicant.find({ jobApplied: id })
      .populate('jobApplied', 'title location') // Populate job details
      .sort({ createdAt: -1 });
    
    return res.status(200).json(
      new ApiResponse(200, { applicants: applicants, totalApplicants: applicants.length },"Applicants retrieved successfully")
    );
    
  } catch (error) {
    console.log("Error getting applicants:", error);
    throw new ApiError(500, "Failed to retrieve applicants");
  }
});

export { addJob, getJob, getHrJobs, getApplicants};
