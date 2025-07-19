import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResumeUploadForJob = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const fileInputRef = useRef();
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setError(null);
    setUploadResults(null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
    setError(null);
    setUploadResults(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const uploadAndParse = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add jobId to the form data
      formData.append('jobId', jobId);
      
      // Add all selected files
      selectedFiles.forEach((file, index) => {
        formData.append(`Resume`, file);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/applicant/uploadResume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setUploadResults(response.data);
      setSelectedFiles([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload and parse resumes');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
            <div>
              <h3>Upload Resumes for Job</h3>
              <p className="text-muted">Upload candidate CVs to extract and store their information for this specific job</p>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/postedJobs')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Jobs
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {uploadResults && (
            <div className="alert alert-success" role="alert">
              <h6 className="alert-heading">
                <i className="bi bi-check-circle me-2"></i>
                Upload Successful!
              </h6>
              <p className="mb-2">
                Successfully processed {uploadResults.data.totalFiles} file(s)
              </p>
              <div className="mt-3">
                <button 
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => navigate(`/job/${jobId}/applicants`)}
                >
                  View Applicants
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setUploadResults(null)}
                >
                  Upload More
                </button>
              </div>
            </div>
          )}

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className="border border-primary border-2 rounded p-5 text-center"
                style={{ 
                  borderStyle: 'dashed', 
                  backgroundColor: '#f8f9ff',
                  minHeight: '300px',
                  cursor: 'pointer'
                }}
                onClick={handleFileClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="mb-4">
                  <i className="bi bi-cloud-upload" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
                </div>
                
                <h5 className="mb-3">Drag and drop resume files here</h5>
                <p className="text-muted mb-4">
                  or click to browse<br/>
                  <small>Supported formats: PDF, DOC, DOCX</small>
                </p>
                
                <button className="btn btn-primary btn-lg" type="button">
                  <i className="bi bi-file-earmark-plus me-2"></i>
                  Select Files
                </button>
                
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h5>Selected Files ({selectedFiles.length})</h5>
                  <div className="list-group">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-file-earmark-text me-3 text-primary"></i>
                          <div>
                            <div className="fw-medium">{file.name}</div>
                            <small className="text-muted">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="d-grid gap-2 mt-4">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={uploadAndParse}
                      disabled={uploading || selectedFiles.length === 0}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Uploading & Parsing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-arrow-up me-2"></i>
                          Upload & Parse Resumes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadForJob;
