import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const InterviewScheduling = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  
  const [qualifiedCandidates, setQualifiedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [interviewLink, setInterviewLink] = useState('');
  const [sendingInterviewLink, setSendingInterviewLink] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchQualifiedCandidates();
    }
  }, [jobId]);

  const fetchQualifiedCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`/api/job/${jobId}/applicants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.data?.applicants) {
        // Filter candidates who passed the aptitude test (aptitute_test: 'Cleared')
        const passedCandidates = response.data.data.applicants.filter(
          applicant => applicant.aptitute_test === 'Cleared'
        );
        
        // Sort by test score in descending order
        const sortedCandidates = passedCandidates.sort((a, b) => 
          (b.testScore || 0) - (a.testScore || 0)
        );
        
        setQualifiedCandidates(sortedCandidates);
      } else {
        setQualifiedCandidates([]);
      }
      
    } catch (error) {
      console.error('Error fetching qualified candidates:', error);
      setError(error.response?.data?.message || 'Failed to fetch qualified candidates');
      
      if (error.response?.status === 401) {
        navigate('/login/hr');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === qualifiedCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(qualifiedCandidates.map(candidate => candidate._id));
    }
  };

  const scheduleInterview = async () => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }

    if (!interviewLink.trim()) {
      alert('Please enter an interview link');
      return;
    }

    setSendingInterviewLink(true);
    // const token = localStorage.getItem('token');

    try {
      // Use the sendInterviewLink API to send emails and update status
      const emailData = {
        applicantIds: selectedCandidates,
        interviewLink: interviewLink.trim(),
        interviewType: 'Interview 1',
        interviewDateTime: new Date().toLocaleDateString() // You can make this dynamic later
      };

      const response = await axios.post('/api/applicant/sendInterviewLink', emailData);

      if (response.data && response.data.data) {
        const result = response.data.data;
        
        // Update local state - set status to 'Interview1_Scheduled' for successfully sent emails
        setQualifiedCandidates(prev => 
          prev.map(candidate => 
            result.results.some(r => r.applicantId === candidate._id) 
              ? { ...candidate, status: 'Interview1_Scheduled' }
              : candidate
          )
        );

        // Clear selections and interview link
        setSelectedCandidates([]);
        setInterviewLink('');

        // Show detailed result
        if (result.emailsFailed > 0) {
          alert(`Interview invitations sent to ${result.emailsSent} candidate(s). ${result.emailsFailed} failed to send. Check console for details.`);
          console.log('Email sending errors:', result.errors);
        } else {
          alert(`Interview invitations sent successfully to ${result.emailsSent} candidate(s)!`);
        }
      }

    } catch (error) {
      console.error('Error sending interview invitations:', error);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        navigate('/login/hr');
      } else if (error.response?.status === 403) {
        alert('You can only send interview invitations to candidates for your own job postings.');
      } else {
        alert(error.response?.data?.message || 'Failed to send interview invitations. Please try again.');
      }
    } finally {
      setSendingInterviewLink(false);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return 'bg-success';
    if (score >= 80) return 'bg-info';
    if (score >= 70) return 'bg-warning';
    return 'bg-secondary';
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="p-4 bg-light" style={{ paddingBottom: '100px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>Interview Scheduling</h3>
            <p className="text-muted">Candidates who passed the aptitude test (Score ≥ 70)</p>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/job/${jobId}/uploadTestResults`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Test Results
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading qualified candidates...</span>
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

        {/* Qualified Candidates List */}
        {!loading && !error && qualifiedCandidates.length > 0 && (
          <>
            {/* Selection and Interview Link Controls */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="selectAll"
                        checked={selectedCandidates.length === qualifiedCandidates.length && qualifiedCandidates.length > 0}
                        onChange={handleSelectAll}
                      />
                      <label className="form-check-label fw-bold" htmlFor="selectAll">
                        Select All ({selectedCandidates.length} selected)
                      </label>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-camera-video"></i>
                      </span>
                      <input 
                        type="url" 
                        className="form-control" 
                        placeholder="Enter interview link (professional email will be sent automatically)"
                        value={interviewLink}
                        onChange={(e) => setInterviewLink(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <button 
                      className="btn btn-success"
                      onClick={scheduleInterview}
                      disabled={selectedCandidates.length === 0 || !interviewLink.trim() || sendingInterviewLink}
                    >
                      {sendingInterviewLink ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Sending Invitations...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope me-2"></i>
                          Send Interview Invitation ({selectedCandidates.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidates Cards */}
            <div className="row">
              <div className="col-12 mb-3">
                <small className="text-muted">
                  <i className="bi bi-sort-down me-1"></i>
                  Sorted by test score (highest first) • {qualifiedCandidates.length} qualified candidate(s)
                </small>
              </div>
              
              {qualifiedCandidates.map((candidate, index) => (
                <div key={candidate._id} className="col-12 mb-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="row align-items-center">
                        {/* Checkbox for selection */}
                        <div className="col-md-1">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`candidate-${candidate._id}`}
                              checked={selectedCandidates.includes(candidate._id)}
                              onChange={() => handleSelectCandidate(candidate._id)}
                            />
                          </div>
                        </div>
                        
                        {/* Candidate Info */}
                        <div className="col-md-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '50px', height: '50px' }}>
                              <span className="text-white fw-bold">
                                {candidate.fullName?.charAt(0)?.toUpperCase() || 'N'}
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-1">{candidate.fullName || 'Unknown'}</h6>
                              <small className="text-muted">{candidate.email || 'No email'}</small>
                              {candidate.phone && (
                                <div>
                                  <small className="text-muted">
                                    <i className="bi bi-telephone me-1"></i>
                                    {candidate.phone}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Skills & Experience */}
                        <div className="col-md-3">
                          <div className="mb-2">
                            <small className="text-muted">
                              <i className="bi bi-briefcase me-1"></i>
                              Experience: {candidate.experience || 'Not specified'}
                            </small>
                          </div>
                          {candidate.skills && candidate.skills.length > 0 && (
                            <div>
                              <small className="text-muted">
                                <i className="bi bi-tools me-1"></i>
                                Skills:
                              </small>
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

                        {/* Test Score & Status */}
                        <div className="col-md-2 text-center">
                          <div className="mb-2">
                            <span className={`badge ${getScoreBadge(candidate.testScore || 0)} fs-6`}>
                              {candidate.testScore || 0}/100
                            </span>
                            <div>
                              <small className="text-muted">Test Score</small>
                            </div>
                          </div>
                          <div className="mb-1">
                            <span className={`badge ${candidate.status === 'Interview_Scheduled' ? 'bg-info' : candidate.status === 'Selected' ? 'bg-success' : 'bg-warning'}`}>
                              {candidate.status || 'Qualified'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-md-3 text-end">
                          <div className="d-flex justify-content-end align-items-center">
                            <div className="me-3">
                              <small className="text-success fw-bold">
                                <i className="bi bi-check-circle me-1"></i>
                                Aptitude: Cleared
                              </small>
                            </div>
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

                      {/* Additional Info */}
                      <div className="row mt-3">
                        <div className="col-md-6">
                          {candidate.qualification && (
                            <small className="text-muted">
                              <i className="bi bi-mortarboard me-1"></i>
                              Education: {candidate.qualification}
                            </small>
                          )}
                        </div>
                        <div className="col-md-6 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {candidate.linkedin && (
                              <a 
                                href={candidate.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="bi bi-linkedin"></i>
                              </a>
                            )}
                            {candidate.github && (
                              <a 
                                href={candidate.github} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-dark btn-sm"
                              >
                                <i className="bi bi-github"></i>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Next Button */}
        {!loading && !error && qualifiedCandidates.length > 0 && (
          <div className="text-center mt-5">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigate(`/job/${jobId}/interview-results`)}
            >
              <i className="bi bi-arrow-right me-2"></i>
              Next: Manage Interview Results
            </button>
          </div>
        )}

        {/* No Qualified Candidates State */}
        {!loading && !error && qualifiedCandidates.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-people display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No qualified candidates yet</h4>
            <p className="text-muted">
              No candidates have passed the aptitude test (score ≥ 70) for this job posting.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate(`/job/${jobId}/uploadTestResults`)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Test Results
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

export default InterviewScheduling;
