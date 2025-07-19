import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ApplicantProfile = () => {
  const { id } = useParams(); // Get applicant ID from URL
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchApplicantDetails();
    }
  }, [id]);

  const fetchApplicantDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/applicant/${id}`);
      
      if (response.data && response.data.data) {
        setApplicant(response.data.data);
      } else {
        setError('Applicant not found');
      }
    } catch (error) {
      console.error('Error fetching applicant details:', error);
      setError(error.response?.data?.message || 'Failed to load applicant details');
      
      if (error.response?.status === 404) {
        setError('Applicant not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-success';
      case 'Interview2_Cleared':
      case 'Interview1_Cleared':
        return 'bg-primary';
      case 'Interview1_Scheduled':
      case 'Interview2_Scheduled':
        return 'bg-info';
      case 'Test_Cleared':
        return 'bg-warning';
      case 'Test_Sent':
        return 'bg-secondary';
      case 'Applied':
        return 'bg-light text-dark';
      case 'Rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getSkillMatchColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading applicant profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger text-center" role="alert">
              <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
              <h4 className="mt-3">{error}</h4>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <i className="bi bi-person-x display-1 text-muted"></i>
          <h4 className="mt-3 text-muted">Applicant not found</h4>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-primary me-3"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </button>
              <h2 className="mb-0">Applicant Profile</h2>
            </div>
            <div className="d-flex gap-2">
              <span className={`badge ${getStatusBadgeClass(applicant.status)} fs-6`}>
                {applicant.status || 'Applied'}
              </span>
              {applicant.jobApplied && (
                <button 
                  className="btn btn-outline-info btn-sm"
                  onClick={() => navigate(`/job/${applicant.jobApplied._id || applicant.jobApplied}/applicants`)}
                >
                  <i className="bi bi-briefcase me-1"></i>
                  View Job
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Personal Information */}
        <div className="col-lg-4 mb-4">
          {/* Profile Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '100px', height: '100px' }}>
                  <span className="text-white fw-bold fs-1">
                    {applicant.fullName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
              <h4 className="card-title">{applicant.fullName || 'Unknown'}</h4>
              <p className="text-muted">{applicant.email}</p>
              
              {/* Contact Information */}
              <div className="mt-3">
                {applicant.phone && (
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <i className="bi bi-telephone me-2 text-primary"></i>
                    <span>{applicant.phone}</span>
                  </div>
                )}
                
                {/* Social Links */}
                <div className="d-flex justify-content-center gap-2 mt-3">
                  {applicant.linkedin && (
                    <a 
                      href={applicant.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-linkedin"></i>
                    </a>
                  )}
                  {applicant.github && (
                    <a 
                      href={applicant.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-dark btn-sm"
                    >
                      <i className="bi bi-github"></i>
                    </a>
                  )}
                  {applicant.uploadedResume && (
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => window.open(applicant.uploadedResume, '_blank')}
                    >
                      <i className="bi bi-download me-1"></i>
                      Resume
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Quick Stats
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <div className="border-end">
                    <h5 className={`mb-1 ${getSkillMatchColor(applicant.skillMatch || 0)}`}>
                      {applicant.skillMatch || 0}%
                    </h5>
                    <small className="text-muted">Skill Match</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <h5 className="mb-1 text-info">
                    {applicant.experience || 0}
                  </h5>
                  <small className="text-muted">Years Exp</small>
                </div>
                <div className="col-6">
                  <h5 className="mb-1 text-warning">
                    {applicant.testScore || 'N/A'}
                  </h5>
                  <small className="text-muted">Test Score</small>
                </div>
                <div className="col-6">
                  <h5 className="mb-1 text-secondary">
                    {new Date(applicant.createdAt).toLocaleDateString()}
                  </h5>
                  <small className="text-muted">Applied On</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="col-lg-8">
          {/* Job Applied */}
          {applicant.jobApplied && (
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  Applied Position
                </h6>
              </div>
              <div className="card-body">
                <h5 className="text-primary">
                  {typeof applicant.jobApplied === 'object' ? applicant.jobApplied.title : 'Position Details'}
                </h5>
                {typeof applicant.jobApplied === 'object' && applicant.jobApplied.location && (
                  <p className="text-muted">
                    <i className="bi bi-geo-alt me-1"></i>
                    {applicant.jobApplied.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Professional Information */}
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Professional Information
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Education:</strong>
                  <p className="text-muted mb-0">{applicant.qualification || 'Not specified'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Experience:</strong>
                  <p className="text-muted mb-0">
                    {applicant.experience ? `${applicant.experience} years` : 'Not specified'}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Previously Worked Here:</strong>
                  <p className="text-muted mb-0">
                    {applicant.workedAtSameCompany ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              
              {/* Skills */}
              {applicant.skills && applicant.skills.length > 0 && (
                <div className="mt-3">
                  <strong>Skills:</strong>
                  <div className="mt-2">
                    {applicant.skills.map((skill, index) => (
                      <span key={index} className="badge bg-light text-dark me-2 mb-2">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessment Progress */}
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Assessment Progress
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Aptitude Test */}
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className={`badge ${applicant.aptitute_test === 'Cleared' ? 'bg-success' : applicant.aptitute_test === 'Not_Cleared' ? 'bg-danger' : 'bg-secondary'} mb-2`}>
                      {applicant.aptitute_test || 'NA'}
                    </div>
                    <p className="mb-0 small">Aptitude Test</p>
                    {applicant.testScore && (
                      <small className="text-muted">Score: {applicant.testScore}/100</small>
                    )}
                  </div>
                </div>

                {/* Interview 1 */}
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className={`badge ${applicant.interview_1 === 'Cleared' ? 'bg-success' : applicant.interview_1 === 'Not_Cleared' ? 'bg-danger' : applicant.interview_1 === 'Undergoing' ? 'bg-warning' : 'bg-secondary'} mb-2`}>
                      {applicant.interview_1 || 'NA'}
                    </div>
                    <p className="mb-0 small">Interview 1</p>
                    {applicant.interview_1_Comments && applicant.interview_1_Comments !== 'None' && (
                      <small className="text-muted d-block">"{applicant.interview_1_Comments}"</small>
                    )}
                  </div>
                </div>

                {/* Interview 2 */}
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <div className={`badge ${applicant.interview_2 === 'Cleared' ? 'bg-success' : applicant.interview_2 === 'Not_Cleared' ? 'bg-danger' : applicant.interview_2 === 'Undergoing' ? 'bg-warning' : 'bg-secondary'} mb-2`}>
                      {applicant.interview_2 || 'NA'}
                    </div>
                    <p className="mb-0 small">Interview 2</p>
                    {applicant.interview_2_Comments && applicant.interview_2_Comments !== 'None' && (
                      <small className="text-muted d-block">"{applicant.interview_2_Comments}"</small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Information */}
          {(applicant.status === 'Selected' && applicant.onboardingMessage) && (
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-person-check me-2"></i>
                  Onboarding Information
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Onboarded On:</strong>
                    <p className="text-muted mb-0">
                      {applicant.onboardedAt ? new Date(applicant.onboardedAt).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
                {applicant.onboardingMessage && (
                  <div className="mt-3">
                    <strong>Onboarding Message:</strong>
                    <div className="bg-light p-3 rounded mt-2">
                      <p className="mb-0 text-muted">"{applicant.onboardingMessage}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Timeline */}
          <div className="card shadow-sm">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Application Timeline
              </h6>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-primary"></div>
                  <div className="timeline-content">
                    <h6 className="mb-1">Application Submitted</h6>
                    <small className="text-muted">
                      {new Date(applicant.createdAt).toLocaleDateString()} at {new Date(applicant.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
                
                {applicant.status !== 'Applied' && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-info"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Status Updated</h6>
                      <small className="text-muted">Current status: {applicant.status}</small>
                    </div>
                  </div>
                )}

                {applicant.onboardedAt && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Onboarded</h6>
                      <small className="text-muted">
                        {new Date(applicant.onboardedAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -25px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 2px #dee2e6;
        }
        
        .timeline-content {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 3px solid #007bff;
        }
      `}</style>
    </div>
  );
};

export default ApplicantProfile;
