import { BrowserRouter,Routes,Route } from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginForm from './components/login'
import RegisterForm from './components/register';
import HomePage from "./Pages/Home";
import LoginHR from "./components/loginHr";
import Profile from './Pages/Profile';
import Career from './Pages/Career';
import Dashboard from "./Pages/Dashboard";
import PostedJobs from './Pages/PostedJobs';
import AddNewJob from './Pages/AddNewJob';
import JobApplicants from './Pages/JobApplicants';
import Screening from "./Pages/Screening";
import ResumeUpload from "./Pages/ResumeUpload";
import ResumeUploadForJob from "./Pages/ResumeUploadForJob";
import UploadTestResults from "./Pages/UploadTestResults";
import InterviewScheduling from "./Pages/InterviewScheduling";
import InterviewResults from "./Pages/InterviewResults";
import FinalOnboarding from "./Pages/FinalOnboarding";
import ApplicantProfile from "./Pages/ApplicantProfile";
import Navigation from './components/navigation';
import Footer from './components/footer';

//import './App.css'

function App() {
  return (
    <>
     <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <Navigation />
          <ToastContainer />
          <main className="flex-grow-1">
            <Routes>
                <Route path='/login/candidate' element={<LoginForm />}></Route>
                <Route path='/register' element={<RegisterForm/>}></Route>
                <Route path="/" element={<HomePage/>}></Route>
                <Route path="/login/hr" element={<LoginHR></LoginHR>}></Route>
                <Route path="/profile" element={<Profile />} />
                <Route path="/career" element={<Career />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/postedJobs" element={<PostedJobs />} />
                <Route path="/addNewJob" element={<AddNewJob />} />
                <Route path="/job/:id/applicants" element={<JobApplicants />} />
                <Route path="/job/:id/upload-cv" element={<ResumeUploadForJob />} />
                <Route path="/job/:id/uploadTestResults" element={<UploadTestResults />} />
                <Route path="/job/:id/interview-scheduling" element={<InterviewScheduling />} />
                <Route path="/job/:id/interview-results" element={<InterviewResults />} />
                <Route path="/job/:id/final-onboarding" element={<FinalOnboarding />} />
                <Route path="/applicant/:id" element={<ApplicantProfile />} />
                <Route path="/screening" element={<Screening />} />
                <Route path="/resumeUpload" element={<ResumeUpload />} />
            </Routes>
          </main>
          <Footer />
        </div>
     </BrowserRouter>
       
    </>
  )
}

export default App
