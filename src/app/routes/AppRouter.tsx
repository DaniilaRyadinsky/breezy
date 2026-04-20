import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import {LoginPage, RegisterPage, MainPage} from '@/pages'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="*" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path="/notes/:noteId" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        {/*<Route path="/recovery" element={<RecoveryPass1 />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter