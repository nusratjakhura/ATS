
import { BrowserRouter,Routes,Route } from "react-router-dom"
import LoginForm from './components/login'
import RegisterForm from './components/register';
import HomePage from "./Pages/Home";
import LoginHR from "./components/loginHr";

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
        </Routes>
     </BrowserRouter>
       
    </>
  )
}

export default App
