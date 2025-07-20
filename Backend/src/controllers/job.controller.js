import { JobDescription } from "../models/jobDescription.model.js";
import { Applicant } from "../models/applicant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import SENDMAIL from "../utils/mail.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

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

const exportApplicantsData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { format = 'excel' } = req.body;
  const { _id: hrId } = req.user;

  if (!id) {
    throw new ApiError(400, "Job ID is required");
  }

  if (!hrId) {
    throw new ApiError(401, "HR authentication required");
  }

  try {
    // Verify that this job belongs to the authenticated HR
    const job = await JobDescription.findById(id).populate('createdBy', 'name email companyName');
    if (!job) {
      throw new ApiError(404, "Job not found");
    }
    
    if (job.createdBy._id.toString() !== hrId.toString()) {
      throw new ApiError(403, "You can only export data for your own job postings");
    }

    // Get all applicants for this job with complete details
    const applicants = await Applicant.find({ jobApplied: id })
      .populate('jobApplied', 'title location salary jobType experienceRequired')
      .sort({ createdAt: -1 });

    if (applicants.length === 0) {
      throw new ApiError(404, "No applicants found for this job");
    }

    // Prepare data for export
    const exportData = applicants.map((applicant, index) => ({
      'S.No': index + 1,
      'Full Name': applicant.fullName || 'N/A',
      'Email': applicant.email || 'N/A',
      'Phone': applicant.phone || 'N/A',
      'Qualification': applicant.qualification || 'N/A',
      'Experience (Years)': applicant.experience || '0',
      'Skills': Array.isArray(applicant.skills) ? applicant.skills.join(', ') : 'N/A',
      'Skill Match %': applicant.skillMatch || '0',
      'LinkedIn': applicant.linkedin || 'N/A',
      'GitHub': applicant.github || 'N/A',
      'Resume URL': applicant.uploadedResume || 'N/A',
      'Application Date': applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : 'N/A',
      'Current Status': applicant.status || 'Applied',
      'Test Score': applicant.testScore || 'N/A',
      'Aptitude Test': applicant.aptitute_test || 'N/A',
      'Interview 1': applicant.interview_1 || 'N/A',
      'Interview 1 Comments': applicant.interview_1_Comments || 'N/A',
      'Interview 2': applicant.interview_2 || 'N/A',
      'Interview 2 Comments': applicant.interview_2_Comments || 'N/A',
      'Onboarding Message': applicant.onboardingMessage || 'N/A',
      'Onboarded At': applicant.onboardedAt ? new Date(applicant.onboardedAt).toLocaleDateString() : 'N/A',
      'Start Date': applicant.startDate ? new Date(applicant.startDate).toLocaleDateString() : 'N/A',
      'Worked at Same Company': applicant.workedAtSameCompany ? 'Yes' : 'No',
      'Job Title': job.title,
      'Job Location': job.location,
      'Job Type': job.jobType || 'N/A',
      'Required Experience': job.experienceRequired || 'N/A',
      'Salary': job.salary || 'N/A'
    }));

    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants Data');

    // Set column widths for better readability
    const columnWidths = [
      { wch: 5 },   // S.No
      { wch: 20 },  // Full Name
      { wch: 25 },  // Email
      { wch: 15 },  // Phone
      { wch: 15 },  // Qualification
      { wch: 12 },  // Experience
      { wch: 30 },  // Skills
      { wch: 12 },  // Skill Match
      { wch: 25 },  // LinkedIn
      { wch: 25 },  // GitHub
      { wch: 40 },  // Resume URL
      { wch: 15 },  // Application Date
      { wch: 20 },  // Status
      { wch: 12 },  // Test Score
      { wch: 15 },  // Aptitude Test
      { wch: 15 },  // Interview 1
      { wch: 30 },  // Interview 1 Comments
      { wch: 15 },  // Interview 2
      { wch: 30 },  // Interview 2 Comments
      { wch: 30 },  // Onboarding Message
      { wch: 15 },  // Onboarded At
      { wch: 15 },  // Start Date
      { wch: 20 },  // Worked at Same Company
      { wch: 25 },  // Job Title
      { wch: 20 },  // Job Location
      { wch: 15 },  // Job Type
      { wch: 18 },  // Required Experience
      { wch: 15 }   // Salary
    ];
    worksheet['!cols'] = columnWidths;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_Applicants_${timestamp}.xlsx`;
    const filePath = path.join(process.cwd(), 'temp', filename);

    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write Excel file
    XLSX.writeFile(workbook, filePath);

    // Prepare email with attachment
    const mailDetails = {
      from: {
        name: 'ATS System',
        address: process.env.GMAIL_USER
      },
      to: job.createdBy.email,
      subject: `Applicants Data Export - ${job.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Applicants Data Export</h2>
          <p>Dear ${job.createdBy.name || 'HR Team'},</p>
          <p>Please find attached the complete applicants data for the job posting: <strong>${job.title}</strong></p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">Export Summary:</h3>
            <ul style="margin: 0;">
              <li><strong>Job Title:</strong> ${job.title}</li>
              <li><strong>Total Applicants:</strong> ${applicants.length}</li>
              <li><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>File Format:</strong> Excel (.xlsx)</li>
            </ul>
          </div>
          
          <p>The Excel file contains comprehensive information about all applicants including:</p>
          <ul>
            <li>Personal information (Name, Email, Phone, etc.)</li>
            <li>Professional details (Experience, Skills, Qualifications)</li>
            <li>Test scores and interview results</li>
            <li>Current application status</li>
            <li>Onboarding information (if applicable)</li>
          </ul>
          
          <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
            This data is confidential and should be handled according to your organization's data protection policies.
          </p>
          
          <p>Best regards,<br>ATS System</p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          path: filePath
        }
      ]
    };

    // Send email with attachment
    await new Promise((resolve, reject) => {
      SENDMAIL(mailDetails, (info) => {
        if (info && info.messageId) {
          resolve(info);
        } else {
          reject(new Error('Failed to send email'));
        }
      });
    });

    // Clean up temp file
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 10000); // Delete after 10 seconds

    return res.status(200).json(
      new ApiResponse(200, {
        message: `Applicants data exported successfully and sent to ${job.createdBy.email}`,
        totalApplicants: applicants.length,
        filename: filename
      }, "Export completed successfully")
    );

  } catch (error) {
    console.log("Error exporting applicants data:", error);
    throw new ApiError(500, "Failed to export applicants data");
  }
});

export { addJob, getJob, getHrJobs, getApplicants, exportApplicantsData};
