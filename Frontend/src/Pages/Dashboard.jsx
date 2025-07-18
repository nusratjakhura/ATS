import { useNavigate } from 'react-router-dom';


const Dashboard = () => {

  const navigate = useNavigate();
  const jobData = [
  {
    title: "UI UX Designer",
    category: "Full Time",
    openings: 7,
    applications: 98,
    status: "applied",
  },
  {
    title: "Full Stack Developer",
    category: "Full Time",
    openings: 9,
    applications: 47,
    status: "test cleared",
  },
  {
    title: "Frontend Developer",
    category: "Internship",
    openings: 4,
    applications: 102,
    status: "test cleared",
  },
  {
    title: "Backend Developer",
    category: "Full Time",
    openings: 5,
    applications: 56,
    status: "test cleared",
  },
  {
    title: "Graphic Designer",
    category: "Full Time",
    openings: 3,
    applications: 56,
    status: "test cleared",
  },
  {
    title: "Graphic Designer",
    category: "Full Time",
    openings: 3,
    applications: 56,
    status: "test cleared",
  },
  {
    title: "Graphic Designer",
    category: "Full Time",
    openings: 3,
    applications: 56,
    status: "test cleared",
  },
   
];


  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
     
      <div className="bg-primary text-white p-3" style={{ width: '260px',height:'100vh',position: 'sticky', top: 0, overflow:'hidden'}}>
        <div className="text-center mb-4">
         
        </div>
        <div className="d-grid gap-3" >
          <button className="btn btn-light text-dark fw-bold" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/postedJobs')}>Jobs</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/resumeUpload')}>Resume Upload</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/screening')}>Screening</button>
        </div>
      </div>

      
      <div className="flex-grow-1 p-4 bg-light">
        <h2 className="mb-4">Dashboard Overview</h2>
        <div className="row g-4">
          
          <div className="col-md-6 col-xl-3">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Total Jobs</h5>
                <p className="card-text fs-4">12</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3 ">
            <div className="card text-center shadow-sm " >
              <div className="card-body">
                <h5 className="card-title">Resumes Uploaded</h5>
                <p className="card-text fs-4">45</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Candidates Screened</h5>
                <p className="card-text fs-4">30</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Interviews Scheduled</h5>
                <p className="card-text fs-4">8</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
  <h4 className="mb-3">Job Listings</h4>
  <div className="table-responsive"  style={{ maxHeight: '600px', overflowY: 'auto' }}>
    <table className="table table-hover table-bordered align-middle text-center shadow-sm">
      <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <tr>
          <th>Job Title</th>
          <th>Category</th>
          <th>Openings</th>
          <th>Applications</th>
          <th>Status</th>
        </tr>
      </thead>
        <tbody>
          {jobData.map((job, index) => (
            <tr key={index} className="py-3">
              <td className="py-3">{job.title}</td>
              <td className="py-3">{job.category}</td>
              <td className="py-3">{job.openings}</td>
              <td className="py-3">{job.applications}</td>
              <td className={`py-3 fw-semibold ${job.status === 'test cleared' ? 'text-primary' : 'text-danger'}`}>
                {job.status}
              </td>
            </tr>
          ))}
        </tbody>
    </table>
  </div>
</div>

      </div>

      

   
       
       
       
    </div>
  );
}


export default Dashboard;

