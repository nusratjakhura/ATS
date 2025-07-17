import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const AddNewJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    experience: '',
    qualification: '',
    location: '',
    salary: '',
    jobType: ''
  });
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      // Create jobData from formData and transform comma-separated strings to arrays
      const jobData = {
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        experience: formData.experience,
        qualification: formData.qualification,
        location: formData.location,
        salary: formData.salary,
        jobType: formData.jobType
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/job/addJob', jobData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Job created successfully:', response.data);
      alert('Job posted successfully!');
      navigate('/postedJobs');
    } catch (error) {
      console.error('Error creating job:', error);
      alert(error.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };
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
        <div className="container" style={{ maxWidth: '700px' }}>
          <div className="text-center mb-5">
            <h3 className="text-primary fw-bold">
              <i className="bi bi-plus-circle me-2"></i>
              Create New Job Posting
            </h3>
            <p className="text-muted">Fill in the details below to post a new job opportunity</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
            <div className="row">
              <div className="col-md-6 mb-4">
                <label htmlFor="title" className="form-label fw-semibold">
                  <i className="bi bi-briefcase me-2"></i>Job Title
                </label>
                <input 
                  type="text" 
                  id="title"
                  name="title"
                  placeholder="e.g. Senior Software Engineer"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">
                  Please provide a job title.
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <label htmlFor="jobType" className="form-label fw-semibold">
                  <i className="bi bi-clock me-2"></i>Job Type
                </label>
                <select 
                  id="jobType"
                  name="jobType"
                  className="form-select"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
                <div className="invalid-feedback">
                  Please select a job type.
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label htmlFor="location" className="form-label fw-semibold">
                  <i className="bi bi-geo-alt me-2"></i>Location
                </label>
                <input 
                  type="text" 
                  id="location"
                  name="location"
                  placeholder="e.g. New York, NY"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">
                  Please provide a location.
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <label htmlFor="salary" className="form-label fw-semibold">
                  <i className="bi bi-currency-dollar me-2"></i>Salary
                </label>
                <input 
                  type="text" 
                  id="salary"
                  name="salary"
                  placeholder="e.g. $80,000 - $120,000"
                  className="form-control"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">
                  Please provide salary information.
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-4">
                <label htmlFor="experience" className="form-label fw-semibold">
                  <i className="bi bi-graph-up me-2"></i>Experience Required
                </label>
                <input 
                  type="text" 
                  id="experience"
                  name="experience"
                  placeholder="e.g. 3-5 years"
                  className="form-control"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">
                  Please specify experience requirements.
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <label htmlFor="qualification" className="form-label fw-semibold">
                  <i className="bi bi-mortarboard me-2"></i>Qualifications
                </label>
                <input 
                  type="text" 
                  id="qualification"
                  name="qualification"
                  placeholder="e.g. Bachelor's, Master's (comma separated)"
                  className="form-control"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">
                  Please provide qualification requirements.
                </div>
                <div className="form-text">
                  Separate multiple qualifications with commas
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="requiredSkills" className="form-label fw-semibold">
                <i className="bi bi-tools me-2"></i>Required Skills
              </label>
              <input 
                type="text" 
                id="requiredSkills"
                name="requiredSkills"
                placeholder="e.g. JavaScript, React, Node.js, MongoDB"
                className="form-control"
                value={formData.requiredSkills}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Please specify required skills.
              </div>
              <div className="form-text">
                Separate multiple skills with commas
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="form-label fw-semibold">
                <i className="bi bi-file-text me-2"></i>Job Description
              </label>
              <textarea 
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                className="form-control"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
              <div className="invalid-feedback">
                Please provide a job description.
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button 
                type="button" 
                className="btn btn-outline-secondary me-md-2"
                onClick={() => navigate('/postedJobs')}
                disabled={loading}
              >
                <i className="bi bi-x-lg me-2"></i>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Post Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewJob;
