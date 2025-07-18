import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import LogoImage from '../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
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
          <>
            <span className="text-white fw-semibold">{user.name}</span>
            <button className="btn btn-light fw-semibold" onClick={handleLogout}>
              Logout
            </button>
          </>
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


