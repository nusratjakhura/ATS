import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import LogoImage from '../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.data.user);
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
    setDropdownOpen(false);
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: "#1e3a5f", padding: "12px 24px", position: 'sticky', top: 0, zIndex: 2 }}
    >
      <div className="d-flex align-items-center">
        <img
          src={LogoImage}
          alt="logo"
          width="45"
          height="45"
          className="me-2"
          style={{ objectFit: "contain" }}
        />
        <span className="navbar-brand mb-0 h4 text-white fw-bold">
          Recruitech
        </span>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        <span
          className="text-white fw-semibold"
          style={{ cursor: "pointer" }}
          onClick={() => navigate('/')}
        >
          Home
        </span>

        {!loading && user ? (
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="btn btn-light dropdown-toggle fw-semibold d-flex align-items-center"
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              {user.name}
            </button>
            <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`}>
              <li>
                <span className="dropdown-item-text">
                  <small className="text-muted">{user.email}</small>
                </span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <>
            <button
              className="btn"
              style={{ backgroundColor: "#ffffff", color: "#000", fontWeight: "500" }}
              onClick={() => navigate('/register')}
            >
              Register
            </button>
            <button
              className="btn btn-light fw-semibold"
              onClick={() => navigate('/login/hr')}
            >
              Log in
            </button>
          </>
        )}
      </div>
    </nav>
  );
}


