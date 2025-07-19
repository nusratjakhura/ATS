import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const UploadTestResults = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const fileInputRef = useRef();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError(null);
        setUploadResults(null);
      } else {
        setError('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadTestResults = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('TestScores', selectedFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/applicant/${jobId}/updateTest`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setUploadResults(response.data);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload test results');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      
      <div className="bg-primary text-white p-3" style={{ width: '260px' }}>
        <div className="text-center mb-4">
          
        </div>

        <div className="d-grid gap-3">
          <button className="btn text-white text-start text-center" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/postedJobs')}>Jobs</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/resumeUpload')}>Resume Upload</button>
          <button className="btn btn-light text-dark fw-bold" onClick={() => navigate('/screening')}>Screening</button>
        </div>
      </div>
      
      <div className="flex-grow-1 p-4 bg-light" style={{ paddingBottom: '100px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>Upload Test Results</h3>
            <p className="text-muted">Upload CSV or Excel file containing test scores for job applicants</p>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/job/${jobId}/applicants`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Applicants
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
              Successfully processed {uploadResults.data.totalProcessed} record(s)
            </p>
            <p className="mb-2">
              <strong>Updated:</strong> {uploadResults.data.successfulUpdates} applicant(s)
            </p>
            {uploadResults.data.errors > 0 && (
              <p className="mb-2 text-warning">
                <strong>Errors:</strong> {uploadResults.data.errors} record(s) had issues
              </p>
            )}
            <div className="mt-3">
              <button 
                className="btn btn-primary btn-sm me-2"
                onClick={() => navigate(`/job/${jobId}/applicants`)}
              >
                View Updated Applicants
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

        {/* File Format Instructions */}
        <div className="card border-info mb-4">
          <div className="card-header bg-info text-white">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              File Format Requirements
            </h6>
          </div>
          <div className="card-body">
            <p className="mb-2">Your file should contain the following columns:</p>
            <ul className="mb-2">
              <li><strong>Email:</strong> Applicant's email address (must match existing applicants)</li>
              <li><strong>Score:</strong> Test score (numeric value)</li>
            </ul>
            <small className="text-muted">
              <strong>Note:</strong> Applicants with scores ≥ 70 will automatically be marked as "Cleared" for aptitude test.
            </small>
          </div>
        </div>

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
                <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
              </div>
              
              <h5 className="mb-3">Drag and drop test results file here</h5>
              <p className="text-muted mb-4">
                or click to browse<br/>
                <small>Supported formats: CSV, XLS, XLSX</small>
              </p>
              
              <button className="btn btn-primary btn-lg" type="button">
                <i className="bi bi-file-earmark-plus me-2"></i>
                Select File
              </button>
              
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            {selectedFile && (
              <div className="mt-4">
                <h5>Selected File</h5>
                <div className="list-group">
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-spreadsheet me-3 text-success"></i>
                      <div>
                        <div className="fw-medium">{selectedFile.name}</div>
                        <small className="text-muted">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={removeFile}
                      disabled={uploading}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                
                <div className="d-grid gap-2 mt-4">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={uploadTestResults}
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up me-2"></i>
                        Upload & Process Test Results
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
  );
};

export default UploadTestResults;
