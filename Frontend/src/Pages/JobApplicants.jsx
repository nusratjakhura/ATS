import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const JobApplicants = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get job ID from URL
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [testLink, setTestLink] = useState('');
  const [sendingTestLink, setSendingTestLink] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    qualifications: [],
    experience: 'All Experience',
    gender: '',
    aptitudeTest: 'All',
    firstInterview: 'All',
    secondInterview: 'All',
    applicationDateFrom: '',
    applicationDateTo: '',
    status: 'All',
    skillMatchMin: 0,
    skillMatchMax: 100
  });

  useEffect(() => {
    if (id) {
      fetchApplicants();
    }
  }, [id]);

  // Apply filters whenever applicants or filters change
  useEffect(() => {
    applyFilters();
  }, [applicants, filters]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`/api/job/${id}/applicants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Applicants API Response:', response.data);
      
      if (response.data?.data?.applicants) {
        // Sort applicants by skillMatch in descending order
        const sortedApplicants = response.data.data.applicants.sort((a, b) => 
          (b.skillMatch || 0) - (a.skillMatch || 0)
        );
        setApplicants(sortedApplicants);
        
        // Extract job details from the first applicant if available
        if (sortedApplicants.length > 0 && sortedApplicants[0].jobApplied) {
          setJobDetails(sortedApplicants[0].jobApplied);
        }
      } else {
        setApplicants([]);
      }
      
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError(error.response?.data?.message || 'Failed to fetch applicants');
      
      if (error.response?.status === 401) {
        navigate('/login/hr');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = (filePath, candidateName) => {
    // Create a download link for the CV
    const link = document.createElement('a');
    link.href = filePath;
    link.download = `${candidateName}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSkillMatchPercentage = (candidateSkills, jobRequiredSkills) => {
    if (!candidateSkills || !jobRequiredSkills || candidateSkills.length === 0 || jobRequiredSkills.length === 0) {
      return 0;
    }
    
    const matchedSkills = candidateSkills.filter(skill => 
      jobRequiredSkills.some(reqSkill => 
        reqSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );
    
    return Math.round((matchedSkills.length / jobRequiredSkills.length) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  // Filter functions
  const applyFilters = () => {
    let filtered = [...applicants];

    // Qualification filter
    if (filters.qualifications.length > 0) {
      filtered = filtered.filter(applicant => 
        filters.qualifications.some(qual => 
          applicant.qualification?.toLowerCase().includes(qual.toLowerCase())
        )
      );
    }

    // Experience filter
    if (filters.experience !== 'All Experience') {
      filtered = filtered.filter(applicant => {
        const exp = parseFloat(applicant.experience) || 0;
        switch (filters.experience) {
          case '0-1 Years':
            return exp >= 0 && exp <= 1;
          case '1-3 Years':
            return exp > 1 && exp <= 3;
          case '3+ Years':
            return exp > 3;
          default:
            return true;
        }
      });
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(applicant => 
        applicant.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    // Status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter(applicant => applicant.status === filters.status);
    }

    // Aptitude test filter
    if (filters.aptitudeTest !== 'All') {
      filtered = filtered.filter(applicant => {
        const passed = applicant.aptitute_test === 'Cleared' || (applicant.testScore && applicant.testScore >= 70);
        return filters.aptitudeTest === 'Passed' ? passed : !passed;
      });
    }

    // First interview filter
    if (filters.firstInterview !== 'All') {
      filtered = filtered.filter(applicant => {
        const passed = applicant.interview_1 === 'Cleared';
        return filters.firstInterview === 'Passed' ? passed : !passed;
      });
    }

    // Second interview filter
    if (filters.secondInterview !== 'All') {
      filtered = filtered.filter(applicant => {
        const passed = applicant.interview_2 === 'Cleared';
        return filters.secondInterview === 'Passed' ? passed : !passed;
      });
    }

    // Skill match filter
    filtered = filtered.filter(applicant => {
      const skillMatch = applicant.skillMatch || 0;
      return skillMatch >= filters.skillMatchMin && skillMatch <= filters.skillMatchMax;
    });

    // Application date filter
    if (filters.applicationDateFrom) {
      filtered = filtered.filter(applicant => 
        new Date(applicant.createdAt) >= new Date(filters.applicationDateFrom)
      );
    }
    if (filters.applicationDateTo) {
      filtered = filtered.filter(applicant => 
        new Date(applicant.createdAt) <= new Date(filters.applicationDateTo)
      );
    }

    setFilteredApplicants(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleQualificationChange = (qualification, checked) => {
    setFilters(prev => ({
      ...prev,
      qualifications: checked 
        ? [...prev.qualifications, qualification]
        : prev.qualifications.filter(q => q !== qualification)
    }));
  };

  const clearFilters = () => {
    setFilters({
      qualifications: [],
      experience: 'All Experience',
      gender: '',
      aptitudeTest: 'All',
      firstInterview: 'All',
      secondInterview: 'All',
      applicationDateFrom: '',
      applicationDateTo: '',
      status: 'All',
      skillMatchMin: 0,
      skillMatchMax: 100
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.qualifications.length > 0) count++;
    if (filters.experience !== 'All Experience') count++;
    if (filters.gender) count++;
    if (filters.status !== 'All') count++;
    if (filters.aptitudeTest !== 'All') count++;
    if (filters.firstInterview !== 'All') count++;
    if (filters.secondInterview !== 'All') count++;
    if (filters.applicationDateFrom || filters.applicationDateTo) count++;
    if (filters.skillMatchMin > 0 || filters.skillMatchMax < 100) count++;
    return count;
  };

  const handleSelectApplicant = (applicantId) => {
    setSelectedApplicants(prev => {
      if (prev.includes(applicantId)) {
        return prev.filter(id => id !== applicantId);
      } else {
        return [...prev, applicantId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedApplicants.length === filteredApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(filteredApplicants.map(applicant => applicant._id));
    }
  };

  const sendTestLink = async () => {
    if (selectedApplicants.length === 0) {
      alert('Please select at least one applicant');
      return;
    }

    if (!testLink.trim()) {
      alert('Please enter a test link');
      return;
    }

    setSendingTestLink(true);
    // const token = localStorage.getItem('token');

    try {
      // Prepare email data with only required fields
      const emailData = {
        applicantIds: selectedApplicants,
        testLink: testLink.trim()
      };

      const response = await axios.post('/api/applicant/sendTestLink', emailData);

      if (response.data && response.data.data) {
        const result = response.data.data;
        
        // Update local state - set status to 'Test_Sent' for successfully sent emails
        setApplicants(prev => 
          prev.map(applicant => 
            result.results.some(r => r.applicantId === applicant._id) 
              ? { ...applicant, status: 'Test_Sent' }
              : applicant
          )
        );

        // Clear selections and test link
        setSelectedApplicants([]);
        setTestLink('');

        // Show detailed result
        if (result.emailsFailed > 0) {
          alert(`Test links sent to ${result.emailsSent} applicant(s). ${result.emailsFailed} failed to send. Check console for details.`);
          console.log('Email sending errors:', result.errors);
        } else {
          alert(`Test links sent successfully to ${result.emailsSent} applicant(s)!`);
        }
      }

    } catch (error) {
      console.error('Error sending test links:', error);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        navigate('/login/hr');
      } else if (error.response?.status === 403) {
        alert('You can only send test links to applicants for your own job postings.');
      } else {
        alert(error.response?.data?.message || 'Failed to send test links. Please try again.');
      }
    } finally {
      setSendingTestLink(false);
    }
  };

  const handleExportApplicantsData = async () => {
    if (!id) {
      alert('Job ID is required for export');
      return;
    }

    try {
      setExportLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        navigate('/login/hr');
        return;
      }

      const response = await axios.post(`/api/job/${id}/exportApplicants`, {
        format: 'excel'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success !== false) {
        alert('Applicants data has been exported and sent to your email successfully! 📧');
      } else {
        alert('Failed to export applicants data. Please try again.');
      }

    } catch (error) {
      console.error('Error exporting applicants data:', error);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        navigate('/login/hr');
      } else if (error.response?.status === 403) {
        alert('You can only export data for your own job postings.');
      } else if (error.response?.status === 404) {
        alert('Job not found or no applicants available for export.');
      } else {
        alert(error.response?.data?.message || 'Failed to export applicants data. Please try again.');
      }
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      {/* Main Content */}
      <div className="p-4 bg-light">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button 
              className="btn btn-outline-primary me-3"
              onClick={() => navigate('/postedJobs')}
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Jobs
            </button>
            <h4 className="d-inline">
              Job Applicants
              {jobDetails && (
                <span className="text-muted ms-2">- {jobDetails.title}</span>
              )}
            </h4>
          </div>
          {!loading && !error && (
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-primary fs-6">
                {filteredApplicants.length} of {applicants.length} {applicants.length === 1 ? 'Applicant' : 'Applicants'}
              </span>
              <button
                className={`btn btn-outline-secondary btn-sm ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bi bi-funnel me-2"></i>
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="badge bg-danger ms-2">{getActiveFilterCount()}</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Job Details Card */}
        {jobDetails && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h5 className="card-title text-primary">{jobDetails.title}</h5>
                  <p className="text-muted mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    {jobDetails.location}
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <small className="text-muted">Job ID: {id}</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                Filter Applicants
              </h6>
              <button className="btn btn-outline-danger btn-sm" onClick={clearFilters}>
                <i className="bi bi-x-circle me-1"></i>
                Clear All
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Qualification Filter */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Qualification</label>
                  <div className="d-flex flex-wrap gap-2">
                    {['MCA', 'MCS', 'ME', 'BE', 'BTech', 'BSc', 'BCA', 'MBA'].map((qual) => (
                      <div key={qual} className="form-check">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          id={qual}
                          checked={filters.qualifications.includes(qual)}
                          onChange={(e) => handleQualificationChange(qual, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={qual}>{qual}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Filter */}
                <div className="col-md-2 mb-3">
                  <label className="form-label fw-bold">Experience</label>
                  <select 
                    className="form-select"
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    <option>All Experience</option>
                    <option>0-1 Years</option>
                    <option>1-3 Years</option>
                    <option>3+ Years</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="col-md-2 mb-3">
                  <label className="form-label fw-bold">Status</label>
                  <select 
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option>All</option>
                    <option>Applied</option>
                    <option>Test_Sent</option>
                    <option>Interview1_Scheduled</option>
                    <option>Interview1_Cleared</option>
                    <option>Interview2_Scheduled</option>
                    <option>Interview2_Cleared</option>
                    <option>Selected</option>
                    <option>Rejected</option>
                  </select>
                </div>

                {/* Skill Match Range */}
                <div className="col-md-2 mb-3">
                  <label className="form-label fw-bold">Skill Match %</label>
                  <div className="d-flex gap-1">
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      placeholder="Min"
                      min="0"
                      max="100"
                      value={filters.skillMatchMin}
                      onChange={(e) => handleFilterChange('skillMatchMin', parseInt(e.target.value) || 0)}
                    />
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      placeholder="Max"
                      min="0"
                      max="100"
                      value={filters.skillMatchMax}
                      onChange={(e) => handleFilterChange('skillMatchMax', parseInt(e.target.value) || 100)}
                    />
                  </div>
                </div>

                {/* Application Date Filter */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Application Date</label>
                  <div className="d-flex gap-1">
                    <input 
                      type="date" 
                      className="form-control form-control-sm" 
                      value={filters.applicationDateFrom}
                      onChange={(e) => handleFilterChange('applicationDateFrom', e.target.value)}
                    />
                    <input 
                      type="date" 
                      className="form-control form-control-sm" 
                      value={filters.applicationDateTo}
                      onChange={(e) => handleFilterChange('applicationDateTo', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <hr />

              <div className="row">
                {/* Recruitment Status Filters */}
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Aptitude Test</label>
                  <select 
                    className="form-select form-select-sm"
                    value={filters.aptitudeTest}
                    onChange={(e) => handleFilterChange('aptitudeTest', e.target.value)}
                  >
                    <option>All</option>
                    <option>Passed</option>
                    <option>Failed</option>
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">First Interview</label>
                  <select 
                    className="form-select form-select-sm"
                    value={filters.firstInterview}
                    onChange={(e) => handleFilterChange('firstInterview', e.target.value)}
                  >
                    <option>All</option>
                    <option>Passed</option>
                    <option>Failed</option>
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Second Interview</label>
                  <select 
                    className="form-select form-select-sm"
                    value={filters.secondInterview}
                    onChange={(e) => handleFilterChange('secondInterview', e.target.value)}
                  >
                    <option>All</option>
                    <option>Passed</option>
                    <option>Failed</option>
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <div className="d-flex align-items-end h-100">
                    <small className="text-muted">
                      Showing {filteredApplicants.length} of {applicants.length} applicants
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading applicants...</span>
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

        {/* Applicants List */}
        {!loading && !error && filteredApplicants.length > 0 && (
          <>
            {/* Selection and Test Link Controls */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="selectAll"
                        checked={selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0}
                        onChange={handleSelectAll}
                      />
                      <label className="form-check-label fw-bold" htmlFor="selectAll">
                        Select All ({selectedApplicants.length} selected)
                      </label>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-link-45deg"></i>
                      </span>
                      <input 
                        type="url" 
                        className="form-control" 
                        placeholder="Enter test link URL (professional email will be sent automatically)"
                        value={testLink}
                        onChange={(e) => setTestLink(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <button 
                      className="btn btn-success"
                      onClick={sendTestLink}
                      disabled={selectedApplicants.length === 0 || !testLink.trim() || sendingTestLink}
                    >
                      {sendingTestLink ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-envelope me-2"></i>
                          Send Test Invitation ({selectedApplicants.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicants Cards */}
            <div className="row">
              <div className="col-12 mb-3">
                <small className="text-muted">
                  <i className="bi bi-sort-down me-1"></i>
                  Sorted by skill match percentage (highest first) • Click on applicant name to view full profile
                  {getActiveFilterCount() > 0 && (
                    <span className="ms-2">
                      <i className="bi bi-funnel me-1"></i>
                      {getActiveFilterCount()} filter(s) applied
                    </span>
                  )}
                </small>
              </div>
            {filteredApplicants.map((applicant, index) => (
              <div key={applicant._id} className="col-12 mb-4">
                <div 
                  className="card border-0 shadow-sm applicant-card" 
                  style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                  }}
                >
                  <div className="card-body">
                    <div className="row align-items-center">
                      {/* Checkbox for selection */}
                      <div className="col-md-1">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`applicant-${applicant._id}`}
                            checked={selectedApplicants.includes(applicant._id)}
                            onChange={(e) => {
                              e.stopPropagation(); // Prevent any parent click events
                              handleSelectApplicant(applicant._id);
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Applicant Info */}
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '50px', height: '50px' }}>
                            <span className="text-white fw-bold">
                              {applicant.fullName?.charAt(0)?.toUpperCase() || 'N'}
                            </span>
                          </div>
                          <div>
                            <h6 
                              className="mb-1"
                              style={{ cursor: 'pointer', color: '#0d6efd' }}
                              onClick={() => navigate(`/applicant/${applicant._id}`)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              {applicant.fullName || 'Unknown'}
                            </h6>
                            <small className="text-muted">{applicant.email || 'No email'}</small>
                            {applicant.phone && (
                              <div>
                                <small className="text-muted">
                                  <i className="bi bi-telephone me-1"></i>
                                  {applicant.phone}
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
                            Experience: {applicant.experience || 'Not specified'}
                          </small>
                        </div>
                        {applicant.skills && applicant.skills.length > 0 && (
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-tools me-1"></i>
                              Skills:
                            </small>
                            <div className="mt-1">
                              {applicant.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                  {skill}
                                </span>
                              ))}
                              {applicant.skills.length > 3 && (
                                <span className="badge bg-secondary">
                                  +{applicant.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Score & Match */}
                      <div className="col-md-2 text-center">
                        <div className="mb-2">
                          <span className={`badge ${getScoreBadge(applicant.skillMatch || 0)} fs-6`}>
                            {(applicant.skillMatch || 0).toFixed(2)}%
                          </span>
                          <div>
                            <small className="text-muted">Skill Match</small>
                          </div>
                        </div>
                        <div className="mb-1">
                          <span className={`badge ${applicant.status === 'Selected' ? 'bg-success' : applicant.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                            {applicant.status || 'Applied'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-md-3 text-end">
                        <div className="d-flex justify-content-end align-items-center">
                          <div className="me-3">
                            <small className="text-muted">
                              Applied: {new Date(applicant.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <div className="btn-group">
                            {applicant.uploadedResume && (
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent any parent click events
                                  handleDownloadCV(applicant.uploadedResume, applicant.fullName);
                                }}
                                title="Download Resume"
                              >
                                <i className="bi bi-download"></i>
                              </button>
                            )}
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent any parent click events
                                navigate(`/applicant/${applicant._id}`);
                              }}
                              title="View Full Profile"
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
                        {applicant.qualification && (
                          <small className="text-muted">
                            <i className="bi bi-mortarboard me-1"></i>
                            Education: {applicant.qualification}
                          </small>
                        )}
                      </div>
                      <div className="col-md-6 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {applicant.linkedin && (
                            <a 
                              href={applicant.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                              onClick={(e) => e.stopPropagation()} // Prevent any parent click events
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
                              onClick={(e) => e.stopPropagation()} // Prevent any parent click events
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
          
          {/* Upload Test Results Button */}
          <div className="text-center mt-4">
            <button 
              className="btn btn-outline-primary btn-lg me-3"
              onClick={() => navigate(`/job/${id}/uploadTestResults`)}
            >
              <i className="bi bi-file-earmark-spreadsheet me-2"></i>
              Upload Test Results
            </button>
            
            <button 
              className="btn btn-success btn-lg"
              onClick={handleExportApplicantsData}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Export & Email All Data
                </>
              )}
            </button>
          </div>
          </>
        )}

        {/* No Applicants State */}
        {!loading && !error && applicants.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-people display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No applicants yet</h4>
            <p className="text-muted">
              This job posting hasn't received any applications yet. Share your job posting to attract candidates!
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/postedJobs')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Jobs
            </button>
          </div>
        )}

        {/* No Filtered Results State */}
        {!loading && !error && applicants.length > 0 && filteredApplicants.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-funnel display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No applicants match your filters</h4>
            <p className="text-muted">
              Try adjusting your filter criteria to see more results.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-outline-primary"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear All Filters
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowFilters(true)}
              >
                <i className="bi bi-funnel me-2"></i>
                Adjust Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicants;
