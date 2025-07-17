import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
     
      <div className="bg-primary text-white p-3" style={{ width: '260px' }}>
        <div className="text-center mb-4">
         
        </div>
        <div className="d-grid gap-3">
          <button className="btn btn-light text-dark fw-bold" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/postedJobs')}>Jobs</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/resumeUpload')}>Resume Upload</button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/screening')}>Screening</button>
        </div>
      </div>


   
       
       
       
    </div>
  );
}


export default Dashboard;

