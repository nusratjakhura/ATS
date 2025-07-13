import { useState } from 'react';
import { Link } from "react-router-dom";
import Navigation from '../navBar/navigation';

export default function LoginHR() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    id:'',
  });

  const [validated, setValidated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Data:', formData);
    const form=e.target;
    if(!form.checkValidity()){
        e.stopPropagation();
    }
    else{
        const loggedUser=JSON.parse(localStorage.getItem("user"));
        console.log(loggedUser);
        alert("login succesfully")
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
    <Navigation></Navigation>
    <div className="container mt-4" style={{ maxWidth: '450px' }}>
      <h2 className="text-center mb-4">Login</h2>

      <form onSubmit={handleSubmit} noValidate className={`border border-dark p-4 rounded shadow-sm ${validated ? 'was-validated' : ''}`}>
        <div className="mb-3">
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
        </div>

        <div className="mb-3">
          <label htmlFor="id" className="form-label">Employee ID</label>
          <input 
            className="form-control"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required 
          />
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
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
        <p className="text-center">
          Don’t have an account? <Link to="/register">Register here</Link></p>
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