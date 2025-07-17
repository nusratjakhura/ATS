import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const ResumeUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      
      
      <div className="bg-primary text-white p-3" style={{ width: '260px' }}>
        <div className="text-center mb-4">
          
        </div>
        <div className="d-grid gap-3">
          <button className="btn text-white text-start text-center" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/postedJobs')}>Jobs</button>
          <button className="btn btn-light text-dark fw-bold" onClick={() => navigate('/resumeUpload')}>Resume Upload</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/screening')}>Screening</button>
        </div>
      </div>

      
      <div className="flex-grow-1 p-5">
        <h3>Upload</h3>
        <p className="text-muted">Upload candidate CVs to extract and store their information</p>

        <div
          className="border border-secondary border-2 rounded d-flex flex-column justify-content-center align-items-center p-5"
          style={{ borderStyle: 'dashed', backgroundColor: '#f9f9f9', maxWidth: '600px' }}
        >
          <div className="mb-3 text-center">
            <i className="bi bi-upload" style={{ fontSize: '2rem', color: '#6c63ff' }}></i>
          </div>
          <p className="mb-1 fw-bold">Drag and drop CV files here</p>
          <p className="text-muted mb-3">or click to browse (PDF format only)</p>
          <button className="btn btn-primary" onClick={handleFileClick}>Select Files</button>
          <input
            type="file"
            accept=".pdf"
            multiple
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
