
// Functional React component that displays a job card with title, description, and two buttons
function JobCard() {
  // Function called when Apply button is clicked
  function handleApply() {
    alert("You clicked Apply!"); // You can replace this with real logic
  }

  // Function called when More Info button is clicked
  function handleMoreInfo() {
    alert("Here is more information about the job."); // Replace with navigation or modal, etc.
  }

  // JSX that renders the card layout
  return (
    <div className="card">
      {/* Job title */}
      <h1 className="card-title">This is Job Card</h1>

      {/* Job description */}
      <p className="card-text">
        This is a job description. It explains what the job is about and the responsibilities involved.
      </p>

      {/* Buttons aligned to the left */}
      <div className="card-buttons">
        {/* Apply button with click handler */}
        <button className="apply-btn" onClick={handleApply}>
          Apply
        </button>

        {/* More Info button with click handler */}
        <button className="info-btn" onClick={handleMoreInfo}>
          More Info
        </button>
      </div>
    </div>
  );
}

export default JobCard;
