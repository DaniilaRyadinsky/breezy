import './App.css'
import LoginPage from '../pages/LoginPage/LoginPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/reg" element={<Registration />} />
        <Route path="*" element={<Main />} />
        <Route path="/recovery" element={<RecoveryPass1 />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
