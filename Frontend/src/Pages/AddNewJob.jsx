import { useNavigate } from 'react-router-dom';

const AddNewJob = () => {
  const navigate = useNavigate();
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      
      <div className="bg-primary text-white p-3" style={{ width: '260px' }}>
        <div className="text-center mb-4">
          
        </div>
        <div className="d-grid gap-3">
          <button className="btn text-white text-start text-center" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-light text-dark fw-bold" onClick={() => navigate('/postedJobs')}>Jobs</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/resumeUpload')}>Resume Upload</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/screening')}>Screening</button>
        </div>
      </div>

      
      <div className="flex-grow-1 p-5">
        <h3 className="text-center mb-5">New Job</h3>
        <form className="mx-auto" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <input type="text" placeholder="Job Title" className="form-control bg-light rounded-pill px-4 py-2" />
          </div>
          <div className="mb-4">
            <input type="text" placeholder="Job Description" className="form-control bg-light rounded-pill px-4 py-2" />
          </div>
          <div className="mb-4">
            <input type="text" placeholder="Required Skills" className="form-control bg-light rounded-pill px-4 py-2" />
          </div>
          <div className="mb-4">
            <input type="text" placeholder="Experience" className="form-control bg-light rounded-pill px-4 py-2" />
          </div>
          <div className="mb-4">
            <input type="text" placeholder="Qualification" className="form-control bg-light rounded-pill px-4 py-2" />
          </div>
          <div className="mb-4">
            <input type="text" placeholder="Location" className="form-control bg-light rounded-pill px-4 py-2" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewJob;
