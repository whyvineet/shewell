import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import DoctorFinder from './pages/DoctorFinder'
import DietAdvice from './pages/DietAdvice'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctor-finder" element={<DoctorFinder />} />
        <Route path="/diet-advice" element={<DietAdvice />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
 )
}

export default App