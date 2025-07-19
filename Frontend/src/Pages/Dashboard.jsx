import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';


const Dashboard = () => {
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalJobs: 0,
      totalApplicants: 0,
      totalInterviews: 0,
      totalSelected: 0
    },
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      // if (!token) {
      //   navigate('/login/hr');
      //   return;
      // }

      const response = await axios.get('/api/hr/dashboard-stats');

      if (response.data && response.data.data) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login/hr');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Selected':
        return 'text-success';
      case 'Interview2_Cleared':
      case 'Interview1_Cleared':
        return 'text-primary';
      case 'Interview1_Scheduled':
      case 'Interview2_Scheduled':
        return 'text-info';
      case 'Test_Cleared':
        return 'text-warning';
      case 'Applied':
        return 'text-secondary';
      case 'Rejected':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button 
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={fetchDashboardData}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Dashboard Overview</h2>
          <button 
            className="btn btn-outline-primary"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Refreshing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Data
              </>
            )}
          </button>
        </div>
        <div className="row g-4">
          
          <div className="col-md-6 col-xl-3 ">
            <div className="card text-center bg-warning shadow-sm">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-briefcase me-2"></i>
                  Total Jobs
                </h5>
                <p className="card-text fs-4">{dashboardData.stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3 ">
            <div className="card text-center text-white bg-info shadow-sm" >
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-people me-2"></i>
                  Total Applicants
                </h5>
                <p className="card-text fs-4">{dashboardData.stats.totalApplicants}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card text-center text-white bg-primary shadow-sm">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-camera-video me-2"></i>
                  Interviews Done
                </h5>
                <p className="card-text fs-4">{dashboardData.stats.totalInterviews}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card text-center text-white bg-success shadow-sm">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-person-check me-2"></i>
                  Selected Candidates
                </h5>
                <p className="card-text fs-4">{dashboardData.stats.totalSelected}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Recent Job Postings</h4>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/postedJobs')}
            >
              <i className="bi bi-eye me-2"></i>
              View All Jobs
            </button>
          </div>
          
          {dashboardData.recentJobs.length > 0 ? (
            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="table table-hover table-bordered align-middle text-center shadow-sm">
                <thead className="table-primary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>Job Title</th>
                    <th>Job Type</th>
                    <th>Location</th>
                    <th>Applications</th>
                    <th>Interviews</th>
                    <th>Posted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentJobs.map((job, index) => (
                    <tr key={job._id || index} className="py-3">
                      <td className="py-3">
                        <div className="text-start">
                          <h6 className="mb-1">{job.title}</h6>
                          <small className="text-muted">
                            {job.requiredSkills && job.requiredSkills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="badge bg-light text-dark me-1">
                                {skill}
                              </span>
                            ))}
                            {job.requiredSkills && job.requiredSkills.length > 3 && (
                              <span className="badge bg-secondary">+{job.requiredSkills.length - 3}</span>
                            )}
                          </small>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`badge ${job.jobType === 'Full Time' ? 'bg-success' : job.jobType === 'Part Time' ? 'bg-warning' : 'bg-info'}`}>
                          {job.jobType}
                        </span>
                      </td>
                      <td className="py-3">{job.location}</td>
                      <td className="py-3">
                        <span className="badge bg-primary fs-6">
                          {job.applicantCount || 0}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-info fs-6">
                          {job.interviewCount || 0}
                        </span>
                      </td>
                      <td className="py-3">
                        <small className="text-muted">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="py-3">
                        <div className="btn-group">
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => navigate(`/job/${job._id}/applicants`)}
                            title="View Applicants"
                          >
                            <i className="bi bi-people"></i>
                          </button>
                          <button 
                            className="btn btn-outline-success btn-sm"
                            onClick={() => navigate(`/job/${job._id}/interview-scheduling`)}
                            title="Manage Process"
                          >
                            <i className="bi bi-gear"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-briefcase display-1 text-muted"></i>
              <h5 className="mt-3 text-muted">No jobs posted yet</h5>
              <p className="text-muted">Start by posting your first job opening.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/addNewJob')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Post Your First Job
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


export default Dashboard;

