import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../utils/fileUpload.js";


const uploadResume = asyncHandler(async(req,res)=>{
    let cvs = [];
    
    if (req.files && typeof req.files === 'object') {
        cvs = Object.values(req.files).flat();
    }
    
    if(!cvs || cvs.length === 0) {
        throw new ApiError(400, "No files were uploaded");
    }
    
    try {
        const uploadResults = [];
        const uploadedUrls = [];
        
        // Iterate over each file & either call python function here OR upload to cloudinary & call python function and Pass Local / URL .
        for(const file of cvs) {
            const uploadResult = await uploadFile(file.path);
            
            if(uploadResult) {
                uploadResults.push({
                    originalName: file.originalname,
                    cloudinaryUrl: uploadResult.url,
                    publicId: uploadResult.public_id,
                    format: uploadResult.format
                });
                uploadedUrls.push(uploadResult.url);
            } else {
                throw new ApiError(500, `Failed to upload file: ${file.originalname}`);
            }
        }
        
        return res.status(200).json(
            new ApiResponse(200, {
                uploadedFiles: uploadResults,
                totalFiles: uploadResults.length,
                urls: uploadedUrls
            }, "Files uploaded successfully to Cloudinary")
        );
        
    } catch (error) {
        console.error("Error uploading files:", error);
        throw new ApiError(500, "Failed to upload files to Cloudinary");
    }
})

export {uploadResume}