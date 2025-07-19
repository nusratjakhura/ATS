import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import Sidebar from '../components/sidebar';

const FinalOnboarding = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [onboardingMessage, setOnboardingMessage] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch candidates eligible for onboarding
  useEffect(() => {
    fetchCandidates();
  }, [jobId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      
      // const token = localStorage.getItem('token');
      // if (!token) {
      //   setError('Authentication required');
      //   return;
      // }

      const response = await axios.get(`/api/job/${jobId}/applicants`, {
        
      });
      console.log(response)

      if (response.data && response.data.data && response.data.data.applicants) {
        // Filter candidates who are eligible for onboarding (Interview2_Cleared or already Selected)
        const eligibleCandidates = response.data.data.applicants.filter(
          candidate => candidate.status === 'Interview2_Cleared' || candidate.status === 'Selected'
        );
        setCandidates(eligibleCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(candidate => candidate._id));
    }
  };

  const handleOnboard = async () => {
    if (selectedCandidates.length === 0) {
      setError('Please select at least one candidate to onboard');
      return;
    }

    if (!onboardingMessage.trim()) {
      setError('Please enter an onboarding message');
      return;
    }

    try {
      setOnboardingLoading(true);
      setError('');
      setSuccessMessage('');

      // const token = localStorage.getItem('token');
      // if (!token) {
      //   setError('Authentication required');
      //   return;
      // }

      // Onboard each selected candidate
      const onboardingPromises = selectedCandidates.map(candidateId =>
        axios.put(`/api/applicant/${candidateId}/onboard`, {
          onboardingMessage: onboardingMessage.trim()
        })
      );

      await Promise.all(onboardingPromises);

      setSuccessMessage(`Successfully onboarded ${selectedCandidates.length} candidate(s)!`);
      setSelectedCandidates([]);
      setOnboardingMessage('');
      
      // Refresh the candidates list
      fetchCandidates();

    } catch (error) {
      console.error('Error onboarding candidates:', error);
      setError('Failed to onboard candidates. Please try again.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Interview2_Cleared':
        return 'bg-success';
      case 'Selected':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        
        <div className="flex-grow-1 p-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading candidates for onboarding...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      
      <div className="flex-grow-1 p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-person-check me-2 text-success"></i>
              Final Onboarding
            </h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <button 
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate('/postedJobs')}
                  >
                    Posted Jobs
                  </button>
                </li>
                <li className="breadcrumb-item">
                  <button 
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate(`/job/${jobId}/interview-results`)}
                  >
                    Interview Results
                  </button>
                </li>
                <li className="breadcrumb-item active" aria-current="page">Final Onboarding</li>
              </ol>
            </nav>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/job/${jobId}/interview-results`)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Interview Results
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {successMessage}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccessMessage('')}
            ></button>
          </div>
        )}

        {/* Onboarding Message Input */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-chat-text me-2"></i>
              Onboarding Message
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter a welcome message for the selected candidates..."
                  value={onboardingMessage}
                  onChange={(e) => setOnboardingMessage(e.target.value)}
                />
                <div className="form-text">
                  This message will be sent to all selected candidates as part of their onboarding.
                </div>
              </div>
              <div className="col-md-4 d-flex align-items-center">
                <button
                  className="btn btn-success btn-lg w-100"
                  onClick={handleOnboard}
                  disabled={onboardingLoading || selectedCandidates.length === 0 || !onboardingMessage.trim()}
                >
                  {onboardingLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Onboarding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Onboard Selected ({selectedCandidates.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        {candidates.length > 0 ? (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-people me-2"></i>
                Eligible Candidates ({candidates.length})
              </h5>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleSelectAll}
              >
                {selectedCandidates.length === candidates.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="50">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th>Candidate</th>
                      <th>Contact</th>
                      <th>Experience</th>
                      <th>Test Score</th>
                      <th>Interview Status</th>
                      <th>Current Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate) => (
                      <tr key={candidate._id} className={selectedCandidates.includes(candidate._id) ? 'table-active' : ''}>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedCandidates.includes(candidate._id)}
                              onChange={() => handleCandidateSelection(candidate._id)}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle me-3">
                              {candidate.fullName?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h6 className="mb-0">{candidate.fullName || 'Unknown'}</h6>
                              <small className="text-muted">{candidate.qualification || 'Not specified'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <small className="d-block">
                              <i className="bi bi-envelope me-1"></i>
                              {candidate.email}
                            </small>
                            {candidate.phone && (
                              <small className="d-block text-muted">
                                <i className="bi bi-telephone me-1"></i>
                                {candidate.phone}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {candidate.experience || 0} years
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${candidate.testScore >= 70 ? 'bg-success' : 'bg-warning'} fs-6`}>
                            {candidate.testScore || 0}/100
                          </span>
                        </td>
                        <td>
                          <div>
                            <small className="d-block">
                              <span className={`badge ${candidate.interview_1 === 'Cleared' ? 'bg-success' : 'bg-secondary'} me-1`}>
                                Interview 1: {candidate.interview_1 || 'NA'}
                              </span>
                            </small>
                            <small className="d-block mt-1">
                              <span className={`badge ${candidate.interview_2 === 'Cleared' ? 'bg-success' : 'bg-secondary'}`}>
                                Interview 2: {candidate.interview_2 || 'NA'}
                              </span>
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(candidate.status)}`}>
                            {candidate.status}
                          </span>
                          {candidate.onboardedAt && (
                            <small className="d-block text-muted mt-1">
                              Onboarded: {new Date(candidate.onboardedAt).toLocaleDateString()}
                            </small>
                          )}
                        </td>
                        <td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-person-x display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No candidates ready for onboarding</h4>
            <p className="text-muted">
              No candidates have cleared both interviews and are eligible for onboarding.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate(`/job/${jobId}/interview-results`)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Interview Results
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

      <style jsx>{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default FinalOnboarding;
