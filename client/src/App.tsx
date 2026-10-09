import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Documents } from './pages/Documents'
import { Upload } from './pages/Upload'
import { Subscription } from './pages/Subscription'
import { Contact } from './pages/Contact'
import { Settings } from './pages/Settings'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="upload" element={<Upload />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="contact" element={<Contact />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
