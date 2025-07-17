# ATS (Applicant Tracking System) API Documentation

## Overview
This is a Node.js/Express.js backend for an Applicant Tracking System that uses AI-powered resume parsing, skill matching, and job management.

## Authentication
All protected routes require JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 HR Authentication Routes

### 1. Register HR
**Endpoint:** `POST /api/hr/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "securePassword123",
  "companyName": "TechCorp Inc"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f7a8b9c1234567890abcdef",
    "name": "John Doe",
    "email": "john@company.com",
    "companyName": "TechCorp Inc"
  },
  "message": "HR Registered Successfully"
}
```

### 2. Login HR
**Endpoint:** `POST /api/hr/login`

**Body:**
```json
{
  "email": "john@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f7a8b9c1234567890abcdef",
    "name": "John Doe",
    "email": "john@company.com",
    "companyName": "TechCorp Inc"
  },
  "message": "User Logged In Successfully"
}
```
*Sets JWT token in HTTP-only cookie*

---

## 💼 Job Management Routes

### 3. Create Job Posting
**Endpoint:** `POST /api/jobs`
**Authentication:** Required (HR)

**Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced developer...",
  "requiredSkills": "JavaScript, React, Node.js, MongoDB",
  "experienceRequired": "3-5 years",
  "location": "New York, NY",
  "qualification": "Bachelor's in Computer Science, Master's in Software Engineering"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f7a8b9c1234567890abcdef",
    "title": "Senior Full Stack Developer",
    "description": "We are looking for an experienced developer...",
    "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "experienceRequired": "3-5 years",
    "location": "New York, NY",
    "qualification": ["Bachelor's in Computer Science", "Master's in Software Engineering"],
    "createdBy": "65f7a8b9c1234567890abcdef",
    "createdAt": "2025-07-17T10:30:00Z"
  },
  "message": "Job posted successfully"
}
```

### 4. Get All Jobs (Public)
**Endpoint:** `GET /api/jobs`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f7a8b9c1234567890abcdef",
      "title": "Senior Full Stack Developer",
      "description": "We are looking for an experienced developer...",
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "location": "New York, NY",
      "createdAt": "2025-07-17T10:30:00Z"
    }
  ],
  "message": "Jobs retrieved successfully"
}
```

### 5. Get HR's Jobs
**Endpoint:** `GET /api/jobs/hr/my-jobs`
**Authentication:** Required (HR)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "65f7a8b9c1234567890abcdef",
        "title": "Senior Full Stack Developer",
        "requiredSkills": ["JavaScript", "React"],
        "location": "New York, NY",
        "createdAt": "2025-07-17T10:30:00Z"
      }
    ],
    "totalJobs": 1
  },
  "message": "HR's jobs retrieved successfully"
}
```

### 6. Get Job Applicants
**Endpoint:** `GET /api/jobs/:id/applicants`
**Authentication:** Required (HR - must own the job)

**Parameters:**
- `id` (path): Job ID

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "65f7a8b9c1234567890abcdef",
      "title": "Senior Developer",
      "location": "New York"
    },
    "applicants": [
      {
        "_id": "65f7a8b9c1234567890abcd01",
        "fullName": "John Doe",
        "email": "john@example.com",
        "skills": ["JavaScript", "React", "Node.js"],
        "uploadedResume": "https://cloudinary.com/...",
        "status": "Applied",
        "skillMatch": 75.5,
        "workedAtSameCompany": false,
        "qualification": "Bachelor",
        "createdAt": "2025-07-17T10:30:00Z"
      }
    ],
    "totalApplicants": 1
  },
  "message": "Applicants retrieved successfully"
}
```

---

## 👤 Applicant Management Routes

### 7. Upload Resume & Apply
**Endpoint:** `POST /api/applicants/upload-resume`
**Content-Type:** `multipart/form-data`

**Form Data:**
```
cvs: [File] (PDF/DOCX resume files)
jobId: "65f7a8b9c1234567890abcdef" (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadedFiles": [
      {
        "originalName": "john_resume.pdf",
        "cloudinaryUrl": "https://res.cloudinary.com/...",
        "publicId": "abc123",
        "format": "pdf",
        "extractedData": {
          "Name": "John Doe",
          "Email": "john@example.com",
          "Phone": "+1234567890",
          "Skills": ["JavaScript", "Python", "React"],
          "Education": "Bachelor",
          "Match_skill": 66.67,
          "Company_Match": false
        },
        "applicantId": "65f7a8b9c1234567890abcd01"
      }
    ],
    "totalFiles": 1,
    "urls": ["https://res.cloudinary.com/..."]
  },
  "message": "Files uploaded and saved to database"
}
```

### 8. Get Applicant Details
**Endpoint:** `GET /api/applicants/:id`

**Parameters:**
- `id` (path): Applicant ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f7a8b9c1234567890abcd01",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "skills": ["JavaScript", "React", "Node.js"],
    "uploadedResume": "https://cloudinary.com/...",
    "status": "Applied",
    "skillMatch": 75.5,
    "workedAtSameCompany": false,
    "qualification": "Bachelor",
    "jobApplied": "65f7a8b9c1234567890abcdef",
    "createdAt": "2025-07-17T10:30:00Z"
  },
  "message": "Fetched Applicant Successfully"
}
```

### 9. Update Applicant Status
**Endpoint:** `PUT /api/applicants/:id/status`
**Authentication:** Required (HR)

**Parameters:**
- `id` (path): Applicant ID

**Body:**
```json
{
  "status": "Interview1_Scheduled"
}
```

**Valid Status Values:**
- `Applied` (default)
- `Test_Sent`
- `Test_Cleared`
- `Interview1_Scheduled`
- `Interview1_Cleared`
- `Interview2_Scheduled`
- `Interview2_Cleared`
- `Selected`
- `Rejected`

**Response:**
```json
{
  "success": true,
  "data": {
    "applicant": {
      "_id": "65f7a8b9c1234567890abcdef",
      "fullName": "John Doe",
      "email": "john@example.com",
      "status": "Interview1_Scheduled",
      "jobApplied": {
        "title": "Senior Developer",
        "location": "New York"
      },
      "updatedAt": "2025-07-17T11:45:00Z"
    },
    "updatedAt": "2025-07-17T11:45:00Z"
  },
  "message": "Applicant status updated successfully"
}
```

---

## 🚫 Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Features

### AI-Powered Resume Processing
- **PDF/DOCX Support**: Automatically extracts text from resume files
- **Skill Extraction**: Identifies technical skills from a comprehensive database
- **Education Recognition**: Detects highest education level
- **Contact Information**: Extracts email, phone, LinkedIn, GitHub
- **Skill Matching**: Calculates percentage match with job requirements
- **Company Experience**: Checks if candidate worked at hiring company

### File Upload & Storage
- **Multer Integration**: Handles multipart form uploads
- **Cloudinary Storage**: Secure cloud storage for resume files
- **Format Validation**: Restricts uploads to PDF and DOCX files

### Database Models
- **HR Model**: Company representatives with authentication
- **Job Model**: Job postings with skills and requirements
- **Applicant Model**: Candidate profiles with parsed resume data

---

## 🛠️ Setup & Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   ```env
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Python Dependencies:**
   ```bash
   pip install spacy pandas PyMuPDF
   python -m spacy download en_core_web_sm
   ```

4. **Start Server:**
   ```bash
   npm start
   ```

---

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   ├── hr.controller.js
│   │   ├── job.controller.js
│   │   └── applicant.controller.js
│   ├── models/
│   │   ├── hr.model.js
│   │   ├── jobDescription.model.js
│   │   └── applicant.model.js
│   ├── routes/
│   └── utils/
├── Model/
│   ├── NLSP.py
│   ├── skills.csv
│   └── Education.csv
└── public/temp/
```
