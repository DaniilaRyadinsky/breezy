import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '../../pages/LoginPage/LoginPage'
import MainPage from '../../pages/MainPage/MainPage'
import RegisterPage from '../../pages/RegistrationPage/RegisterPage'
import ProtectedRoute from './ProtectedRoute'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="*" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        {/*<Route path="/recovery" element={<RecoveryPass1 />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter