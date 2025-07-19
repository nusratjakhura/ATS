import { useNavigate } from 'react-router-dom';

const Screening = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="p-5">
        <h3 className="mb-4">Screening Filters</h3>
        <div className="card p-4" style={{ maxWidth: '500px' }}>
          <div className="mb-3">
            <label className="form-label fw-bold">Qualification</label>
            <div className="d-flex flex-wrap gap-3">
              {['MCA', 'MCS', 'ME', 'BE', 'BTech', 'BSc'].map((qual, idx) => (
                <div key={idx}>
                  <input type="checkbox" className="form-check-input me-1" id={qual} />
                  <label htmlFor={qual}>{qual}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Experience</label>
            <select className="form-select">
              <option>All Experience</option>
              <option>0-1 Years</option>
              <option>1-3 Years</option>
              <option>3+ Years</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Gender</label>
            <div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gender" id="male" />
                <label className="form-check-label" htmlFor="male">Male</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gender" id="female" />
                <label className="form-check-label" htmlFor="female">Female</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gender" id="other" />
                <label className="form-check-label" htmlFor="other">Other</label>
              </div>
            </div>
          </div>

          <hr />

          <div className="mb-3">
            <label className="form-label fw-bold">Recruitment Status</label>
            <div className="mb-2">
              <label className="form-label">Aptitude Test</label>
              <select className="form-select">
                <option>All</option>
                <option>Passed</option>
                <option>Failed</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">First Interview</label>
              <select className="form-select">
                <option>All</option>
                <option>Passed</option>
                <option>Failed</option>
              </select>
            </div>
            <div>
              <label className="form-label">Second Interview</label>
              <select className="form-select">
                <option>All</option>
                <option>Passed</option>
                <option>Failed</option>
              </select>
            </div>
          </div>

          <hr />

          <div>
            <label className="form-label fw-bold">Application Date</label>
            <div className="d-flex gap-2">
              <input type="date" className="form-control" placeholder="From" />
              <input type="date" className="form-control" placeholder="To" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screening;