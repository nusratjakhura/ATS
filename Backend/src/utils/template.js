
const HTML_TEMPLATE = (options) => {
  const {
    companyName = 'Company Name',
    applicantName = 'Dear Candidate',
    jobTitle = 'Position',
    testLink = '#',
    message = 'Please take the assessment test.',
    hrName = 'HR Team',
    buttonText = 'Take Action'
  } = options;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Assessment Test Invitation</title>
        <style>
          .container {
            width: 100%;
            height: 100%;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .email-header {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: #fff;
            padding: 30px 20px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
          }
          .email-header p {
            margin: 5px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .email-body {
            padding: 30px 20px;
            line-height: 1.6;
            color: #333;
          }
          .message-content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            white-space: pre-line;
          }
          .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .cta-section {
            text-align: center;
            margin: 30px 0;
          }
          .job-details {
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
            margin-top: 30px;
          }
          .email-footer {
            background-color: #f8f9fa;
            color: #666;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email">
            <div class="email-header">
              <h1>${companyName}</h1>
              <p>Assessment Test Invitation</p>
            </div>
            <div class="email-body">
              <div class="message-content">
                ${message}
              </div>
              
              <div class="cta-section">
                <a href="${testLink}" class="cta-button">
                  ${buttonText}
                </a>
              </div>
              
              <div class="job-details">
                <p><strong>Position:</strong> ${jobTitle}</p>
                <p><strong>Company:</strong> ${companyName}</p>
              </div>
            </div>
            <div class="email-footer">
              <p>This is an automated message from the ATS system. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default HTML_TEMPLATE;