import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../utils/fileUpload.js";
import { Applicant } from "../models/applicant.model.js";
import { JobDescription } from "../models/jobDescription.model.js";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const uploadResume = asyncHandler(async (req, res) => {
  let cvs = [];

  if (req.files && typeof req.files === "object") {
    cvs = Object.values(req.files).flat();
  }

  if (!cvs || cvs.length === 0) {
    throw new ApiError(400, "No files were uploaded");
  }

  // Get jobId from request body
  const { jobId } = req.body;
  
  // Get job details and HR company name
  let jdSkills = [];
  let companyName = "Unknown";
  
  try {
    if (jobId) {
      const jobDetails = await JobDescription.findById(jobId).populate('createdBy');
      if (jobDetails) {
        jdSkills = jobDetails.requiredSkills || [];
        
        // Get company name from HR who created the job
        if (jobDetails.createdBy && jobDetails.createdBy.companyName) {
          companyName = jobDetails.createdBy.companyName;
        }
      }
    }
  } catch (error) {
    console.log("Error fetching job details:", error);
  }

  try {
    const uploadResults = [];
    const uploadedUrls = [];

    // Iterate over each file & either call python function here
    for (const file of cvs) {
      let extractedData = {};
      try {
        const pythonScriptPath = path.join(process.cwd(), "Model", "NLSP.py");
        const skillsJson = JSON.stringify(jdSkills);
        const command = `python3 "${pythonScriptPath}" "${file.path}" '${skillsJson}' "${companyName}"`;
        
        // console.log(`Executing: ${command}`);
        // console.log(`JD Skills: ${skillsJson}, Company: ${companyName}`);

        const { stdout, stderr } = await execAsync(command, {
          cwd: process.cwd(),
        });

        if (stderr) {
          console.error(`Python stderr for ${file.originalname}:`, stderr);
        }

        try {
          extractedData = JSON.parse(stdout.trim());
        } catch (parseError) {
          console.error(
            `Failed to parse Python output for ${file.originalname}:`,
            parseError
          );
          extractedData = { raw_output: stdout.trim() };
        }

      } catch (pythonError) {
        console.error(
          `Error processing ${file.originalname} with Python:`,
          pythonError
        );
        extractedData = {
          error: `Failed to process resume: ${pythonError.message}`,
        };
      }

      //Cloudinary Upload
      const uploadResult = await uploadFile(file.path);
      if (uploadResult) {
        uploadResults.push({
          originalName: file.originalname,
          cloudinaryUrl: uploadResult.url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          extractedData: extractedData,
        });
        uploadedUrls.push(uploadResult.url);

        try {
          // Create applicant record in database
          const applicantData = {
            fullName: extractedData.Name || null,
            email: extractedData.Email || null,
            phone: extractedData.Phone
              ? extractedData.Phone.replace(/[^\d]/g, "")
              : null,
            linkedin: extractedData.LinkedIn || null,
            github: extractedData.GitHub || null,
            skills: extractedData.Skills || [],
            uploadedResume: uploadResult.url,
            jobApplied: jobId || null,
            workedAtSameCompany:extractedData.Company_Match,
            qualification:extractedData.Education,
            skillMatch:extractedData.Match_skill
          };

          if (applicantData.email || applicantData.fullName) {
            const newApplicant = await Applicant.create(applicantData);

            // Add the database ID to the response
            uploadResults[uploadResults.length - 1].applicantId =
              newApplicant._id;
          } else {
            console.log(
              `Skipping database save for ${file.originalname} - no email or name found`
            );
          }
        } catch (dbError) {
          console.error(`Error saving applicant to database:`, dbError);
        }
      } else {
        throw new ApiError(500, `Failed to upload file: ${file.originalname}`);
      }

    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          uploadedFiles: uploadResults,
          totalFiles: uploadResults.length,
          urls: uploadedUrls,
        },
        "Files uploaded and saved to database"
      )
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    throw new ApiError(500, "Failed to upload files to Cloudinary");
  }
});

const getApplicantData = asyncHandler(async(req, res)=>{

  const {id} = req.params;
  
  if(!id){
    throw new ApiError(400, "Must Specify Applicant ID")
  }
  try {
    const appl = await Applicant.findOne({_id:id})
    
    if(!appl){
      throw new ApiError(404, "No Such Applicant Exists")
    }

    return res.status(200)
    .json(new ApiResponse(200, appl, "Fetched Applicant Successfully"))

  } catch (error) {
    console.log("Can't get the applicant", error)
    throw new ApiError(500, "Can't get the applicant from database")
  }
});

const updateStatus = asyncHandler(async(req, res)=>{
  const {id} = req.params;
  const {status} = req.body;

  if(!id || !status){
    throw new ApiError(400, "Specify Applicant's id and status")
  }

  try {
    // Find and update the applicant
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      { status: status },
      { 
        new: true, // Return the updated document
        runValidators: true // Run mongoose validations
      }
    ).populate('jobApplied', 'title location');

    if(!updatedApplicant){
      throw new ApiError(404, "Applicant not found");
    }

    return res.status(200).json(
      new ApiResponse(200, {
        applicant: updatedApplicant,
        previousStatus: status,
        updatedAt: new Date()
      }, "Applicant status updated successfully")
    );

  } catch (error) {
    console.log("Can't update the applicant", error)
    throw new ApiError(500, "Can't update the applicant in database")
  }
})

export { uploadResume, getApplicantData, updateStatus };
