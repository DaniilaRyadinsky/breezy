import './App.css'
import LoginPage from '../pages/LoginPage/LoginPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RegisterPage from '../pages/RegistrationPage/RegisterPage'
import MainPage from '../pages/MainPage/MainPage'

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reg" element={<RegisterPage />} />
        <Route path="*" element={<MainPage />} />
        {/*<Route path="/recovery" element={<RecoveryPass1 />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
