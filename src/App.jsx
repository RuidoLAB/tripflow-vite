import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Trips from './pages/Trips'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Trips />} />
        <Route path="/trip/:id" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
