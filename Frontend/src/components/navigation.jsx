import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null); // Changed from "" to null for better checking
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // const token = localStorage.getItem('token');
      // if (token) {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.data.user); // Set the entire user object, not just the name
        // console.log(response.data.data.user)
      // }/
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {

      await axios.post('/api/hr/logout');
    } catch (error) {
      console.error('Logout API failed:', error);
      
    }
    
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
      <div className="container">
        <Link className="navbar-brand fw-bold text-white" to="/">
          <i className="bi bi-briefcase-fill me-2"></i>
          ATS Portal
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">
                <i className="bi bi-house-fill me-1"></i>
                Home
              </Link>
            </li>

            {/* <li className="nav-item">
              <Link className="nav-link text-white" to="/career">
                <i className="bi bi-search me-1"></i>
                Careers
              </Link>
            </li> */}

            {!loading && (
              <>
                {user ? (
                  <li className="nav-item dropdown">
                    <button 
                      className="nav-link text-white dropdown-toggle border-0 bg-transparent" 
                      type="button" 
                      id="userDropdown" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                      style={{
                        textDecoration: 'none',
                        transition: 'text-decoration 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      <i className="bi bi-person-circle me-2"></i>
                      Hi, {user.name}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li>
                        <Link className="dropdown-item" to="/dashboard">
                          <i className="bi bi-speedometer2 me-2"></i>
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          <i className="bi bi-person me-2"></i>
                          Profile
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/register">
                        <i className="bi bi-person-plus me-1"></i>
                        Register
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/login/hr">
                        <i className="bi bi-box-arrow-in-right me-1"></i>
                        Login
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
            
            {loading && (
              <li className="nav-item">
                <div className="spinner-border spinner-border-sm text-light" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

