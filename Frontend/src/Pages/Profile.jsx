import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    navigate('/career');
  };

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-primary text-white p-4" style={{ width: '250px' }}>
        <h4>User Profile</h4>
        <div className="mt-4">
          <button className="btn btn-light w-100 mb-3">Personal Info</button>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-5 bg-white ">
        

        <form className="mx-auto" style={{ maxWidth: '500px' }} onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">First name</label>
              <input type="text" className="form-control" required/>
            </div>
            <div className="col">
              <label className="form-label">Last name</label>
              <input type="text" className="form-control"  required/>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <div className="d-flex align-items-center">
                <select className="form-select me-2" style={{ maxWidth: '100px', height: '38px' }}>
                <option>+91</option>
                <option>+1</option>
                <option>+44</option>
                </select>
                <input
                type="tel"
                className="form-control"
                placeholder="Phone number"
                pattern="[0-9]{10}"
                title="Enter 10 digit number"
                required
                />
            </div>
          </div>


          <div className="mb-4">
            <label className="form-label">Email</label>
            <input type="email" className="form-control"  required/>
          </div>

          <div className="text-center">
            <button type="submit" className="btn btn-primary px-5">SAVE</button>
            <br></br>
            <br></br>
            
          </div>
        </form>
        <div className="text-center">
          <button type="submit" className="btn btn-primary px-5 text-center"onClick={() => navigate('/career')} >Go To Dashboard</button>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;
