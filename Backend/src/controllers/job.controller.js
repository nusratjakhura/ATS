import { JobDescription } from "../models/jobDescription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    experienceRequired,
    location,
    qualification,
  } = req.body;
  const {_id} = req.user;
  if (
    !title ||
    !requiredSkills ||
    !experienceRequired ||
    !location ||
    !qualification
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
      experienceRequired,
      location,
      qualification: qualificationArray,
      createdBy:_id,
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
    .json( new ApiResponse(200, { jobs, totalJobs: jobs.length}, "Jobs retrieved successfully"));

  } catch (error) {
    console.log("Error : ", error);
    throw new ApiError(500, "Can't retrieve job(s)");
  }
});

export { addJob, getJob };
