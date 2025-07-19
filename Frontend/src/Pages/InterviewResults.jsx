import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const InterviewResults = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  
  const [interviewCandidates, setInterviewCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (jobId) {
      fetchInterviewCandidates();
    }
  }, [jobId]);

  const fetchInterviewCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`/api/job/${jobId}/applicants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.data?.applicants) {
        // Filter candidates who have been scheduled for interviews
        const scheduledCandidates = response.data.data.applicants.filter(
          applicant => applicant.status && (
            applicant.status.includes('Interview') || 
            applicant.aptitute_test === 'Cleared'
          )
        );
        
        // Sort by test score in descending order
        const sortedCandidates = scheduledCandidates.sort((a, b) => 
          (b.testScore || 0) - (a.testScore || 0)
        );
        
        setInterviewCandidates(sortedCandidates);
      } else {
        setInterviewCandidates([]);
      }
      
    } catch (error) {
      console.error('Error fetching interview candidates:', error);
      setError(error.response?.data?.message || 'Failed to fetch interview candidates');
      
      if (error.response?.status === 401) {
        navigate('/login/hr');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateInterviewResult = async (candidateId, interviewType, result, comments = '') => {
    try {
      setUpdating(prev => ({ ...prev, [candidateId]: true }));
      
      const token = localStorage.getItem('token');
      const endpoint = interviewType === 'interview1' 
        ? `/api/applicant/${candidateId}/updateInterview1`
        : `/api/applicant/${candidateId}/updateInterview2`;
      
      const payload = interviewType === 'interview1' 
        ? { interview_1: result, interview_1_Comments: comments }
        : { interview_2: result, interview_2_Comments: comments };

      await axios.put(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Refresh the candidates list
      await fetchInterviewCandidates();
      
      alert(`Interview ${interviewType === 'interview1' ? '1' : '2'} result updated successfully`);
      
    } catch (error) {
      console.error('Error updating interview result:', error);
      alert(`Failed to update interview result: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Interview1_Scheduled': 'bg-info',
      'Interview1_Cleared': 'bg-success',
      'Interview2_Scheduled': 'bg-primary',
      'Interview2_Cleared': 'bg-success',
      'Selected': 'bg-success',
      'Rejected': 'bg-danger'
    };
    return statusColors[status] || 'bg-secondary';
  };

  const getInterviewBadge = (interviewStatus) => {
    const statusColors = {
      'Cleared': 'bg-success',
      'Not_Cleared': 'bg-danger',
      'Undergoing': 'bg-warning',
      'NA': 'bg-secondary'
    };
    return statusColors[interviewStatus] || 'bg-secondary';
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="p-4 bg-light" style={{ paddingBottom: '100px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>Interview Results Management</h3>
            <p className="text-muted">Update interview results and candidate status</p>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/job/${jobId}/interview-scheduling`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Scheduling
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading candidates...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Interview Candidates List */}
        {!loading && !error && interviewCandidates.length > 0 && (
          <div className="row">
            <div className="col-12 mb-3">
              <small className="text-muted">
                <i className="bi bi-sort-down me-1"></i>
                Sorted by test score (highest first) • {interviewCandidates.length} candidate(s)
              </small>
            </div>
            
            {interviewCandidates.map((candidate) => (
              <div key={candidate._id} className="col-12 mb-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row">
                      {/* Candidate Info */}
                      <div className="col-md-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '50px', height: '50px' }}>
                            <span className="text-white fw-bold">
                              {candidate.fullName?.charAt(0)?.toUpperCase() || 'N'}
                            </span>
                          </div>
                          <div>
                            <h6 className="mb-1">{candidate.fullName || 'Unknown'}</h6>
                            <small className="text-muted">{candidate.email || 'No email'}</small>
                            <div>
                              <span className={`badge ${getStatusBadge(candidate.status)} mt-1`}>
                                {candidate.status || 'Applied'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Test Score */}
                        <div className="mb-2">
                          <span className="badge bg-info fs-6">
                            Test Score: {candidate.testScore || 0}/100
                          </span>
                        </div>
                        
                        {/* Skills */}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div>
                            <small className="text-muted">Skills:</small>
                            <div className="mt-1">
                              {candidate.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 3 && (
                                <span className="badge bg-secondary">
                                  +{candidate.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Interview 1 Management */}
                      <div className="col-md-4">
                        <h6 className="text-primary mb-3">
                          <i className="bi bi-person-video me-2"></i>
                          Interview 1
                        </h6>
                        
                        <div className="mb-2">
                          <span className={`badge ${getInterviewBadge(candidate.interview_1)}`}>
                            {candidate.interview_1 || 'NA'}
                          </span>
                        </div>
                        
                        {candidate.interview_1_Comments && candidate.interview_1_Comments !== 'None' && (
                          <div className="mb-2">
                            <small className="text-muted">Comments:</small>
                            <p className="small">{candidate.interview_1_Comments}</p>
                          </div>
                        )}
                        
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              const comments = prompt('Enter comments (optional):') || '';
                              updateInterviewResult(candidate._id, 'interview1', 'Cleared', comments);
                            }}
                            disabled={updating[candidate._id]}
                          >
                            {updating[candidate._id] ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-check-circle me-1"></i>
                            )}
                            Mark Cleared
                          </button>
                          
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              const comments = prompt('Enter rejection reason:') || '';
                              updateInterviewResult(candidate._id, 'interview1', 'Not_Cleared', comments);
                            }}
                            disabled={updating[candidate._id]}
                          >
                            {updating[candidate._id] ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-x-circle me-1"></i>
                            )}
                            Mark Failed
                          </button>
                          
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              const comments = prompt('Enter progress notes:') || '';
                              updateInterviewResult(candidate._id, 'interview1', 'Undergoing', comments);
                            }}
                            disabled={updating[candidate._id]}
                          >
                            <i className="bi bi-clock me-1"></i>
                            In Progress
                          </button>
                        </div>
                      </div>

                      {/* Interview 2 Management */}
                      <div className="col-md-4">
                        <h6 className="text-primary mb-3">
                          <i className="bi bi-person-video2 me-2"></i>
                          Interview 2
                        </h6>
                        
                        <div className="mb-2">
                          <span className={`badge ${getInterviewBadge(candidate.interview_2)}`}>
                            {candidate.interview_2 || 'NA'}
                          </span>
                        </div>
                        
                        {candidate.interview_2_Comments && candidate.interview_2_Comments !== 'None' && (
                          <div className="mb-2">
                            <small className="text-muted">Comments:</small>
                            <p className="small">{candidate.interview_2_Comments}</p>
                          </div>
                        )}
                        
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              const comments = prompt('Enter comments (optional):') || '';
                              updateInterviewResult(candidate._id, 'interview2', 'Cleared', comments);
                            }}
                            disabled={updating[candidate._id] || candidate.interview_1 !== 'Cleared'}
                          >
                            {updating[candidate._id] ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-check-circle me-1"></i>
                            )}
                            Mark Cleared
                          </button>
                          
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              const comments = prompt('Enter rejection reason:') || '';
                              updateInterviewResult(candidate._id, 'interview2', 'Not_Cleared', comments);
                            }}
                            disabled={updating[candidate._id] || candidate.interview_1 !== 'Cleared'}
                          >
                            {updating[candidate._id] ? (
                              <span className="spinner-border spinner-border-sm me-1"></span>
                            ) : (
                              <i className="bi bi-x-circle me-1"></i>
                            )}
                            Mark Failed
                          </button>
                          
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              const comments = prompt('Enter progress notes:') || '';
                              updateInterviewResult(candidate._id, 'interview2', 'Undergoing', comments);
                            }}
                            disabled={updating[candidate._id] || candidate.interview_1 !== 'Cleared'}
                          >
                            <i className="bi bi-clock me-1"></i>
                            In Progress
                          </button>
                        </div>
                        
                        {candidate.interview_1 !== 'Cleared' && (
                          <small className="text-muted mt-2 d-block">
                            Complete Interview 1 first
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="row mt-3 pt-3 border-top">
                      <div className="col-md-6">
                        {candidate.qualification && (
                          <small className="text-muted">
                            <i className="bi bi-mortarboard me-1"></i>
                            Education: {candidate.qualification}
                          </small>
                        )}
                      </div>
                      <div className="col-md-6 text-end">
                        <div className="btn-group">
                          {candidate.uploadedResume && (
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => window.open(candidate.uploadedResume, '_blank')}
                              title="Download Resume"
                            >
                              <i className="bi bi-download"></i>
                            </button>
                          )}
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/applicant/${candidate._id}`)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Next Button to Final Onboarding */}
        {!loading && !error && interviewCandidates.length > 0 && (
          <div className="text-center mt-5 mb-4">
            <button 
              className="btn btn-success btn-lg"
              onClick={() => navigate(`/job/${jobId}/final-onboarding`)}
            >
              <i className="bi bi-arrow-right me-2"></i>
              Next: Final Onboarding
            </button>
          </div>
        )}

        {/* No Candidates State */}
        {!loading && !error && interviewCandidates.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-person-video display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No interview candidates found</h4>
            <p className="text-muted">
              No candidates have been scheduled for interviews yet.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate(`/job/${jobId}/interview-scheduling`)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Scheduling
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/job/${jobId}/applicants`)}
              >
                <i className="bi bi-people me-2"></i>
                View All Applicants
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewResults;
