
const Dashboard = () => {
  
  const postedJobs = [1, 2, 3]; 

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      
      <div className="bg-primary text-white p-3" style={{ width: '260px' }}>
        <div className="text-center mb-4">
          
        </div>
        <div className="d-grid gap-3">
          <button className="btn btn-light text-dark fw-bold">Jobs</button>
          <button className="btn text-white text-start text-center">Resume Upload</button>
          <button className="btn text-white text-start text-center">Screening</button>
          <button className="btn text-white text-start text-center">Settings</button>
        </div>
      </div>

      
      <div className="flex-grow-1 p-4 bg-light">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="text"
            className="form-control rounded-pill px-4"
            placeholder="Search"
            style={{ maxWidth: '800px' }}
          />
          <button className="btn btn-secondary"> + Add New Job</button>
        </div>

        <h5 className="mb-4">Your Posted Jobs</h5>
        <div className="d-flex flex-column gap-3">
          {postedJobs.map((_, idx) => (
            <div
              key={idx}
              className="d-flex justify-content-between align-items-center p-3 rounded"
              style={{ backgroundColor: '#e8e8e8' }}
            >
              
              <div>
                <h5>Job Title</h5>
                <p>Job Description<br></br>Posted on date<br></br>Applications received</p>
              </div>
              <button className="btn btn-light">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
