import CenterImage from '../assets/icon.png';  // your uploaded center image

const HomePage = () => {
  return (
    <div>
      <div className="bg-light py-5 d-flex align-items-center">
        <div className="container py-2 d-flex align-items-center justify-content-between  flex-wrap">
          
          <div className="text-start" style={{ maxWidth: "600px" }}>
            <h2 className="display-3 fw-bold text-dark mb-3">
              Effortless<br />Recruitment<br />Begins Here
            </h2>
            <p className="lead text-secondary text-dark">
              Simplify your hiring process with intelligent screening, smart pipelines, and seamless job posting, all in one modern ATS platform.
            </p>
            
            <button className="card-hover btn btn-primary btn-lg mt-3" style={{ backgroundColor: "#1e3a5f", padding: "12px 24px" }}>
              Start Now  →
            </button>
          </div>

          {/* Right Image Section */}
          <div>
            <img
              src={CenterImage}
              alt="ATS illustration"
              className="img-fluid"
              style={{ maxWidth: "400px" }}
            />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container py-4">
        <div className="row g-4 text-center">
          
          <div className="col-md-4">
            <div
              className="card-hover p-4 rounded-4 text-white h-100 d-flex flex-column justify-content-center"
              style={{ backgroundColor: "#e1b84b", minHeight: "400px" }}
            >
              <h2 className="fw-bold mb-3">Smart Candidate Screening</h2>
              <p className="mb-0 fs-4">
                Quickly filter and rank applicants — no more manual resume checks.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card-hover p-4 rounded-4 text-white h-100 d-flex flex-column justify-content-center"
              style={{ backgroundColor: "#59a8d9", minHeight: "400px" }}
            >
              <h2 className="fw-bold mb-3">Custom Hiring Pipeline</h2>
              <p className="mb-0 fs-4">
                Create and manage your own recruitment stages with ease.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card-hover p-4 rounded-4 text-white h-100 d-flex flex-column justify-content-center"
              style={{ backgroundColor: "#9393a4", minHeight: "400px" }}
            >
              <h2 className="fw-bold mb-3">One-Click Job Posting</h2>
              <p className="mb-0 fs-4">
                Post jobs everywhere and track all applicants in one place.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>  
  );
};

export default HomePage;
