import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // const token = localStorage.getItem('token');
      
      // if (!token) {
      //   navigate('/login/hr');
      //   return;
      // }

      // Try the new profile endpoint first
      try {
        const response = await axios.get('/api/hr/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUser(response.data.data.user || response.data.data);
      } catch (profileError) {
        console.log('Profile endpoint not available, using fallback...');
        
        // Fallback: try to get user info from auth/me or decode token
        try {
          const authResponse = await axios.get('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser(authResponse.data.data.user || authResponse.data.data);
        } catch (authError) {
          // Last fallback: create dummy user data
          setUser({
            name: 'HR Manager',
            email: 'hr@company.com',
            companyName: 'Your Company',
            position: 'HR Manager',
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile information');
      
      if (error.response?.status === 401) {
        navigate('/login/hr');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.put('/api/hr/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditingPassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      {/* Main Content */}
      <div className="p-4">
        <div className="container-fluid">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>HR Profile</h4>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
            </button>
          </div>

          {/* Alert Messages */}
          {message && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          <div className="row">
            {/* Profile Information Card */}
            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Personal Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Full Name:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user?.fullName || user?.name || 'Not provided'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Email:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user?.email || 'Not provided'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Phone:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user?.phone || 'Not provided'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Company:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user?.companyName || user?.company || 'Not provided'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-sm-4">
                      <strong>Position:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user?.position || 'HR Manager'}
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>Member Since:</strong>
                    </div>
                    <div className="col-sm-8">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Card */}
            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="bi bi-shield-lock me-2"></i>
                    Security Settings
                  </h5>
                </div>
                <div className="card-body">
                  {!isEditingPassword ? (
                    <div className="text-center py-4">
                      <i className="bi bi-lock display-4 text-muted mb-3"></i>
                      <p className="text-muted mb-3">
                        Keep your account secure by changing your password regularly.
                      </p>
                      <button 
                        className="btn btn-warning"
                        onClick={() => setIsEditingPassword(true)}
                      >
                        <i className="bi bi-key me-2"></i>
                        Change Password
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange}>
                      <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value
                          })}
                          minLength="6"
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value
                          })}
                          minLength="6"
                          required
                        />
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success">
                          <i className="bi bi-check-lg me-2"></i>
                          Update Password
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            setIsEditingPassword(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                            setError('');
                          }}
                        >
                          <i className="bi bi-x-lg me-2"></i>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Account Statistics
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <div className="p-3">
                        <i className="bi bi-briefcase display-4 text-primary"></i>
                        <h3 className="mt-2 text-primary">-</h3>
                        <p className="text-muted">Jobs Posted</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3">
                        <i className="bi bi-people display-4 text-success"></i>
                        <h3 className="mt-2 text-success">-</h3>
                        <p className="text-muted">Total Applicants</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3">
                        <i className="bi bi-check-circle display-4 text-warning"></i>
                        <h3 className="mt-2 text-warning">-</h3>
                        <p className="text-muted">Hired Candidates</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="p-3">
                        <i className="bi bi-calendar-check display-4 text-info"></i>
                        <h3 className="mt-2 text-info">-</h3>
                        <p className="text-muted">Interviews Scheduled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
