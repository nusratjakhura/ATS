import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPostedJobs();
  }, []);

  const fetchPostedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // if (!token) {
      //   navigate('/login/hr');
      //   return;
      // }

      const response = await axios.get('/api/job/getHrJobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response.data); // Debug log
      
      // Handle different response structures
      let jobs = [];
      if (response.data && response.data.data && response.data.data.jobs) {
        jobs = Array.isArray(response.data.data.jobs) ? response.data.data.jobs : [response.data.data.jobs];
      } else if (response.data && response.data.data) {
        jobs = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else if (response.data && Array.isArray(response.data)) {
        jobs = response.data;
      }
      
      setPostedJobs(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.response?.data?.message || 'Failed to fetch jobs');
      setPostedJobs([]); // Ensure it's always an array
      
      if (error.response?.status === 401) {
        navigate('/login/hr');
      }
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="p-4 bg-light" style={{ paddingBottom: '150px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="text"
            className="form-control rounded-pill px-4"
            placeholder="Search"
            style={{ maxWidth: '800px' }}
          />
          <button className="btn btn-secondary" onClick={() => navigate('/addNewJob')}> + Add New Job</button>
        </div>

        <h5 className="mb-4">
          Your Posted Jobs 
          {!loading && !error && (
            <span className="badge bg-primary ms-2">
              {postedJobs.length} {postedJobs.length === 1 ? 'Job' : 'Jobs'}
            </span>
          )}
        </h5>
        
        {loading && (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="row g-4">
          {Array.isArray(postedJobs) && postedJobs.map((job) => (
            <div key={job._id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column">
                  <div className="mb-3">
                    <h5 className="card-title text-primary fw-bold">{job.title || 'No Title'}</h5>
                    <p className="text-muted mb-2">
                      <i className="bi bi-geo-alt me-2"></i>
                      {job.location || 'No Location'}
                    </p>
                    <p className="text-muted mb-2">
                      <i className="bi bi-briefcase me-2"></i>
                      {job.jobType || 'No Job Type'}
                    </p>
                    <p className="text-muted mb-2">
                      <i className="bi bi-currency-dollar me-2"></i>
                      {job.salary || 'No Salary Info'}
                    </p>
                    
                    {/* Required Skills */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-tools me-1"></i>
                          Skills:
                        </small>
                        <div className="mt-1">
                          {job.requiredSkills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="badge bg-light text-dark me-1 mb-1">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 3 && (
                            <span className="badge bg-secondary">
                              +{job.requiredSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Qualifications */}
                    {job.qualification && job.qualification.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="bi bi-mortarboard me-1"></i>
                          Qualifications:
                        </small>
                        <div className="mt-1">
                          {job.qualification.slice(0, 2).map((qual, index) => (
                            <span key={index} className="badge bg-info text-dark me-1 mb-1">
                              {qual}
                            </span>
                          ))}
                          {job.qualification.length > 2 && (
                            <span className="badge bg-secondary">
                              +{job.qualification.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3 flex-grow-1">
                    <p className="card-text text-truncate" style={{ maxHeight: '60px', overflow: 'hidden' }}>
                      {job.description || 'No Description'}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown'}
                      </small>
                      <span className="badge bg-secondary">
                        <i className="bi bi-people me-1"></i>
                        {job.applicants?.length || 0} {job.applicants?.length === 1 ? 'Application' : 'Applications'}
                      </span>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => navigate(`/job/${job._id}/applicants`)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Applied
                      </button>
                      <button 
                        className="btn btn-outline-primary btn-sm flex-fill"
                        onClick={() => navigate(`/job/${job._id}/upload-cv`)}
                      >
                        <i className="bi bi-file-earmark-arrow-up me-1"></i>
                        Add CV
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!loading && !error && postedJobs.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-briefcase display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No jobs posted yet</h4>
            <p className="text-muted">Start by creating your first job posting!</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/addNewJob')}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Post Your First Job
            </button>
          </div>
        )}
        
        {!loading && !error && postedJobs.length === 1 && (
          <div className="text-center mt-4">
            <p className="text-muted">
              <i className="bi bi-info-circle me-2"></i>
              You have one job posted. Consider adding more to reach a wider audience!
            </p>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate('/addNewJob')}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Another Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
