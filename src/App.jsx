import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Trips from './pages/Trips'
import Dashboard from './pages/Dashboard'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080A0F' }}>
      <div className="spinner" style={{ width: 28, height: 28, borderColor: 'rgba(74,230,164,0.2)', borderTopColor: '#4AE6A4' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
          <Route path="/trip/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
