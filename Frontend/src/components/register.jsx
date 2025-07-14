import { useState } from "react";
import Navigation from '../navBar/navigation';
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
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

  const handleSubmit = (e) => {
    e.preventDefault(); 
    const form = e.target;
    if (!form.checkValidity()) {
      e.stopPropagation();
    } 
    else {
      console.log("Submitted Data:", JSON.stringify(formData));
      localStorage.setItem("user", JSON.stringify(formData));
      navigate("/login");
    }
    setValidated(true);
  };

  return (
    <>
    <Navigation></Navigation>
    <h2 className="mt-5 text-center">Register</h2>
    <div className="container mt-3 border rounded border-dark px-4" style={{ maxWidth: '450px' }}>
      
      <form  onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`} >
        <div className="mb-3 mt-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input 
            type="text" 
            className="form-control" 
            id="username" 
            name="username" 
            value={formData.username}
            onChange={handleChange}
            required 
          />
            <div className="invalid-feedback">
                Please choose a valid username.
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

        <button type="submit" className="btn btn-primary w-100 mb-3">Register</button>
      </form>
    </div>
    </>
  );
}
