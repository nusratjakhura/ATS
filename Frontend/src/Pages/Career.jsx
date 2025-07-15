import React from 'react';
import { useNavigate } from 'react-router-dom';

const Career = () => {
  const navigate = useNavigate();
 
  return (
     
    <div>
      <div className="d-flex justify-content-between align-items-center p-3 bg-primary text-white">
        <div className="d-flex align-items-center">
          <div className="rounded-circle bg-white text-primary d-flex justify-content-center align-items-center me-2" role="button" onClick={() => navigate('/profile')} style={{ width: '40px', height: '40px' }}>
            <i className="bi bi-person"></i>
          </div>
          <span>Username</span>
        </div>
        <div>
          <a className="text-white me-4" href="/">Home</a>
          <button className="btn btn-light btn-sm">Your Jobs</button>
        </div>
      </div>

      <div className="d-flex justify-content-center my-4">
        <input type="text" placeholder="Search Jobs" className="form-control w-50 rounded-pill px-4 py-2 border border-dark" />
      </div>

      <div className="container">
        <h5>Applied Jobs</h5>
        <div className="row">
          <div className="col-md-6">
            {/* Job List */}
            {[1, 2, 3].map((job, idx) => (
              <div key={idx} className="text-dark rounded p-3 mb-3 border" style={{backgroundColor: '#d3d1d1ff'}}>
                <h6>Job Title</h6>
                <p>Company<br />Location<br />Applied on date</p>
              </div>
            ))}
          </div>

          <div className="col-md-6">
            {/* Job Details */}
            <div className="text-dark rounded p-4" style={{backgroundColor: '#e8e8e8'}}>
              <h4>Job Title</h4>
              <p>
                company<br />
                location<br />
                posted on date<br />
                apply before date<br />
                salary<br /><br />
                <strong>About Company:</strong><br />
                <br />
                <strong>Job Description:</strong>
                
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
