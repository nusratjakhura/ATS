import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../utils/fileUpload.js";
import { Applicant } from "../models/applicant.model.js";
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

  try {
    const uploadResults = [];
    const uploadedUrls = [];

    // Iterate over each file & either call python function here
    for (const file of cvs) {
      // Call Python script to extract data from the resume
      let extractedData = {};
      try {
        const pythonScriptPath = path.join(process.cwd(), "NLSP.py");
        const command = `python3 "${pythonScriptPath}" "${file.path}"`;

        // console.log(`Executing: ${command}`);
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
        //   console.log(`Raw Python output:`, stdout);
          extractedData = { raw_output: stdout.trim() };
        }

        // console.log(`Extracted data for ${file.originalname}:`, extractedData);
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

        //SET THE DOCUMENT IN DB OF THAT USER
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
            jobApplied: req.body.jobId || null, // Get jobId from URL parameters
          };

          if (applicantData.email || applicantData.fullName) {
            const newApplicant = await Applicant.create(applicantData);
            // console.log(`Applicant saved to database:`, newApplicant._id);

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
      //END OF FOR LOOP, STUFF TO LIE ABOVE
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

export { uploadResume };
