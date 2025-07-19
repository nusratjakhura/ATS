import { useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function LoginHR() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async(e) => {
      e.preventDefault();
      const form = e.target;

      if (!form.checkValidity()) {
        e.stopPropagation();
      } 
      else {
        try {
          const response = await axios.post('/api/hr/login', formData);
          console.log("Login Success:", response.data);
          
          // Store the token if provided
          if (response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
          }
          
          toast.success("Login successful!");
          window.location.href = "/dashboard"; // Full page reload 
        } 
        catch (error) {
          toast.error("Login failed!");
        }
      }

      setValidated(true);
    
  };

  const handleGoogleLogin = () => {
    console.log('Logging in with Google');
    // Redirect to Google Authentication
  };

  const handleGitHubLogin = () => {
    console.log('Logging in with GitHub');
    // Redirect to GitHub Auth
  };

  return (
    <>
    <div className="container mt-4 mb-5 " style={{ maxWidth: '450px' }}>
      <h2 className="text-center mb-4 " style={{ color: '#183B5C' }}>Login</h2>

      <form onSubmit={handleSubmit} noValidate className={`border p-4 rounded shadow-lg ${validated ? 'was-validated' : ''}`}>
        <div className="mb-3 ">
          <label htmlFor="email" className="form-label">Email address</label>
          <input 
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <div className="invalid-feedback">
            Please enter a valid email address.
          </div>
        </div>
        
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input 
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required 
          />
          <div className="invalid-feedback">
            Please enter your password.
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3" >Login</button>
        <p className="text-center">
          Don't have an account? <Link to="/register">Register here</Link></p>
        <hr />

        <button type="button" className="btn btn-outline-danger w-100 mb-2" onClick={handleGoogleLogin}>
          <i className="bi bi-google me-2"></i> Login with Google
        </button>

        <button type="button" className="btn btn-outline-dark w-100" onClick={handleGitHubLogin}>
          <i className="bi bi-github me-2"></i> Login with GitHub
        </button>
      </form>
    </div>
    </>
  );
}