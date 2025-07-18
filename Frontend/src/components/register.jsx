import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "../api/axiosConfig";
import axios from "axios";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName:'',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
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
    else if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      e.stopPropagation();
    }
    else {
      try {
        const response = await axios.post('/api/hr/register', {
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          password: formData.password
        });
        console.log("Registration Success:", response.data);
        alert("Registered successfully!");
        navigate("/login/hr");
      } 
      catch (error) {
        console.error("Registration error:", error);
        alert(error.response?.data?.message || "Registration failed");
      }
    }
    setValidated(true);
  };

  return (
    <>
    <h2 className="mt-5 text-center">Register</h2>
    <div className="container mt-3 border rounded border-dark px-4" style={{ maxWidth: '450px' }}>
      
      <form  onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`} >
        <div className="mb-3 mt-3">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="name" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
            <div className="invalid-feedback">
                Please enter your full name.
            </div>
        </div>
        
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
          <div className="invalid-feedback">
                Please choose a valid email.
            </div>
        </div>

        <div className="mb-3">
          <label htmlFor="company" className="form-label">Company Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="company" 
            name="companyName" 
            value={formData.companyName}
            onChange={handleChange}
            required 
          />
          <div className="invalid-feedback">
                Please enter your company name.
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
                Please enter a password.
            </div>
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required 
          />
          <div className="invalid-feedback">
                Please confirm your password.
            </div>
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>
      </form>
    </div>
    </>
  );
}
