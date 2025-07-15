import { BrowserRouter,Routes,Route } from "react-router-dom"
import LoginForm from './components/login'
import RegisterForm from './components/register';
import HomePage from "./Pages/Home";
import LoginHR from "./components/loginHr";
import Profile from './Pages/Profile';
import Career from './Pages/Career';
import Dashboard from './Pages/Dashboard';
//import './App.css'

function App() {
  return (
    <>
     <BrowserRouter>
        <Routes>
            <Route path='/login/candidate' element={<LoginForm />}></Route>
            <Route path='/register' element={<RegisterForm/>}></Route>
            <Route path="/" element={<HomePage/>}></Route>
            <Route path="/login/hr" element={<LoginHR></LoginHR>}></Route>
            <Route path="/profile" element={<Profile />} />
            <Route path="/career" element={<Career />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
     </BrowserRouter>
       
    </>
  )
}

export default App
