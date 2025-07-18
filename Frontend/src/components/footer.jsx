
export default function Footer() {
  return (
    <footer className="bg-light text-dark py-4 mt-auto">
      <div className="container text-center">
        <div className="row">
          <div className="card-hover col-md-4 mb-3 mb-md-0">
            <h5>About Us</h5>
            <p className="small">
              We are dedicated to providing the best web experience. Contact us for more details.
            </p>
          </div>

          <div className="card-hover col-md-4 mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-dark text-decoration-none">Home</a></li>
              <li><a href="#" className="text-dark text-decoration-none">About</a></li>
              <li><a href="#" className="text-dark text-decoration-none">Contact</a></li>
            </ul>
          </div>

          <div className="card-hover col-md-4">
            <h5>Follow Us</h5>
            <a href="#" className="text-dark me-3"><i className="bi bi-facebook"></i></a>
            <a href="#" className="text-dark me-3"><i className="bi bi-twitter"></i></a>
            <a href="#" className="text-dark"><i className="bi bi-instagram"></i></a>
          </div>
        </div>

        <hr className="border-light" />
        <p className="mb-0 small">&copy; {new Date().getFullYear()} ATS. All rights reserved.</p>
      </div>
    </footer>
  );
}
