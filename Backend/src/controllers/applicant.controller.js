import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../utils/fileUpload.js";
import { Applicant } from "../models/applicant.model.js";
import { JobDescription } from "../models/jobDescription.model.js";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import XLSX from "xlsx";

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

const addTestScore = asyncHandler(async(req,res)=>{
  const { id: jobId } = req.params; 
  const { _id: hrId } = req.user; 

  if(!jobId || !hrId){
    throw new ApiError(400, "Job ID and HR authentication required");
  }
  
  // Check if file was uploaded
  if(!req.files || Object.keys(req.files).length === 0){
    throw new ApiError(400, "CSV or Excel file is required");
  }
  
  try {
    // Verify that this job belongs to the authenticated HR
    const job = await JobDescription.findById(jobId);
    if(!job){
      throw new ApiError(404, "Job not found");
    }
    
    if(job.createdBy.toString() !== hrId.toString()){
      throw new ApiError(403, "You can only update scores for your own job postings");
    }
    
    // Get the file from req.files - it should be under the 'TestScores' field
    const file = req.files.TestScores ? req.files.TestScores[0] : Object.values(req.files)[0];
    
    if(!file){
      throw new ApiError(400, "No file uploaded");
    }
    
    const filePath = file.path;
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    let scoreData = [];
    
    if(fileExtension === '.csv'){
      // Parse CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Normalize column names (case-insensitive)
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
              const normalizedKey = key.toLowerCase().trim();
              if(normalizedKey.includes('email')){
                normalizedRow.email = row[key].trim();
              } else if(normalizedKey.includes('score')){
                normalizedRow.score = parseFloat(row[key]);
              }
            });
            
            if(normalizedRow.email && !isNaN(normalizedRow.score)){
              scoreData.push(normalizedRow);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
    } else if(fileExtension === '.xlsx' || fileExtension === '.xls'){
      // Parse Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      jsonData.forEach(row => {
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = key.toLowerCase().trim();
          if(normalizedKey.includes('email')){
            normalizedRow.email = row[key];
          } else if(normalizedKey.includes('score')){
            normalizedRow.score = parseFloat(row[key]);
          }
        });
        
        if(normalizedRow.email && !isNaN(normalizedRow.score)){
          scoreData.push(normalizedRow);
        }
      });
      
    } else {
      throw new ApiError(400, "Unsupported file format. Please upload CSV or Excel file");
    }
    
    if(scoreData.length === 0){
      throw new ApiError(400, "No valid data found. Please ensure file has 'Email' and 'Score' columns");
    }
    
    // Update applicants with test scores
    const updateResults = [];
    const errors = [];
    
    for(const record of scoreData){
      try {
        const updatedApplicant = await Applicant.findOneAndUpdate(
          { 
            email: record.email, 
            jobApplied: jobId,
            status: 'Test_Sent'
          },
          { 
            testScore: record.score,
            
            ...(record.score >= 70 && { aptitute_test: 'Cleared' })
          },
          { 
            new: true,
            runValidators: true 
          }
        );
        
        if(updatedApplicant){
          updateResults.push({
            email: record.email,
            score: record.score,
            applicantId: updatedApplicant._id,
            updated: true
          });
        } else {
          errors.push({
            email: record.email,
            score: record.score,
            error: "Applicant not found for this job or test not sent to this applicant"
          });
        }
        
      } catch (error) {
        errors.push({
          email: record.email,
          score: record.score,
          error: error.message
        });
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    return res.status(200).json(
      new ApiResponse(200, {
        job: {
          id: job._id,
          title: job.title
        },
        totalProcessed: scoreData.length,
        successfulUpdates: updateResults.length,
        errors: errors.length,
        results: updateResults,
        ...(errors.length > 0 && { errors })
      }, `Test scores updated successfully. ${updateResults.length} applicants updated, ${errors.length} errors`)
    );
    
  } catch (error) {
    // Clean up uploaded file if it exists
    if(req.files && Object.keys(req.files).length > 0){
      const file = req.files.TestScores ? req.files.TestScores[0] : Object.values(req.files)[0];
      if(file && fs.existsSync(file.path)){
        fs.unlinkSync(file.path);
      }
    }
    
    console.log("Error adding test scores:", error);
    throw new ApiError(500, "Failed to process test scores");
  }
})

const updateInterview1 = asyncHandler(async(req, res) => {
  const { id } = req.params;
  const { interview_1, interview_1_Comments } = req.body;

  if (!id) {
    throw new ApiError(400, "Applicant ID is required");
  }

  if (!interview_1 || !['Cleared', 'Not_Cleared', 'Undergoing'].includes(interview_1)) {
    throw new ApiError(400, "Valid interview_1 status is required (Cleared, Not_Cleared, or Undergoing)");
  }

  try {
    // Find and update the applicant
    const updateData = {
      interview_1: interview_1,
      ...(interview_1_Comments && { interview_1_Comments: interview_1_Comments })
    };

    // Update status based on interview result
    if (interview_1 === 'Cleared') {
      updateData.status = 'Interview1_Cleared';
    } else if (interview_1 === 'Not_Cleared') {
      updateData.status = 'Rejected';
    } else if (interview_1 === 'Undergoing') {
      updateData.status = 'Interview1_Scheduled';
    }

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run mongoose validations
      }
    ).populate('jobApplied', 'title location');

    if (!updatedApplicant) {
      throw new ApiError(404, "Applicant not found");
    }

    return res.status(200).json(
      new ApiResponse(200, {
        applicant: updatedApplicant,
        updatedAt: new Date()
      }, "Interview 1 status updated successfully")
    );

  } catch (error) {
    console.log("Can't update interview 1 status:", error);
    throw new ApiError(500, "Can't update interview 1 status in database");
  }
});

const updateInterview2 = asyncHandler(async(req, res) => {
  const { id } = req.params;
  const { interview_2, interview_2_Comments } = req.body;

  if (!id) {
    throw new ApiError(400, "Applicant ID is required");
  }

  if (!interview_2 || !['Cleared', 'Not_Cleared', 'Undergoing'].includes(interview_2)) {
    throw new ApiError(400, "Valid interview_2 status is required (Cleared, Not_Cleared, or Undergoing)");
  }

  try {
    // Find and update the applicant
    const updateData = {
      interview_2: interview_2,
      ...(interview_2_Comments && { interview_2_Comments: interview_2_Comments })
    };

    // Update status based on interview result
    if (interview_2 === 'Cleared') {
      updateData.status = 'Interview2_Cleared';
    } else if (interview_2 === 'Not_Cleared') {
      updateData.status = 'Rejected';
    } else if (interview_2 === 'Undergoing') {
      updateData.status = 'Interview2_Scheduled';
    }

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run mongoose validations
      }
    ).populate('jobApplied', 'title location');

    if (!updatedApplicant) {
      throw new ApiError(404, "Applicant not found");
    }

    return res.status(200).json(
      new ApiResponse(200, {
        applicant: updatedApplicant,
        updatedAt: new Date()
      }, "Interview 2 status updated successfully")
    );

  } catch (error) {
    console.log("Can't update interview 2 status:", error);
    throw new ApiError(500, "Can't update interview 2 status in database");
  }
});

const onboardCandidate = asyncHandler(async(req, res) => {
  const { id } = req.params;
  const { onboardingMessage } = req.body;

  if (!id) {
    throw new ApiError(400, "Applicant ID is required");
  }

  try {
    // Find and update the applicant
    const updateData = {
      status: 'Selected',
      onboardingMessage: onboardingMessage || 'Congratulations! You have been selected for the position.',
      onboardedAt: new Date()
    };

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run mongoose validations
      }
    ).populate('jobApplied', 'title location');

    if (!updatedApplicant) {
      throw new ApiError(404, "Applicant not found");
    }

    return res.status(200).json(
      new ApiResponse(200, {
        applicant: updatedApplicant,
        onboardedAt: new Date()
      }, "Candidate onboarded successfully")
    );

  } catch (error) {
    console.log("Can't onboard candidate:", error);
    throw new ApiError(500, "Can't onboard candidate in database");
  }
});

export { uploadResume, getApplicantData, updateStatus, addTestScore, updateInterview1, updateInterview2, onboardCandidate };
