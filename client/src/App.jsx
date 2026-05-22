import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from './components/common/Navbar'
import SearchPage from './pages/SearchPage'
import ResultsPage from './pages/ResultsPage'
import SeatSelectionPage from './pages/SeatSelectionPage'
import BookingFormPage from './pages/BookingFormPage'
import ConfirmationPage from './pages/ConfirmationPage'
import MyBookingsPage from './pages/MyBookingsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

const ProtectedRoute = ({ children }) => {
  const session = useSelector(s => s.auth.session)
  return session ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                  element={<SearchPage />} />
          <Route path="/results"           element={<ResultsPage />} />
          <Route path="/seats/:flightId"   element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>} />
          <Route path="/book/:flightId"    element={<ProtectedRoute><BookingFormPage /></ProtectedRoute>} />
          <Route path="/confirmation"      element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
          <Route path="/my-bookings"       element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/signup"            element={<SignupPage />} />
          <Route path="*"                  element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}
