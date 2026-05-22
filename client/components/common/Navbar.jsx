import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { resetBookings } from '../../store/slices/bookingsSlice'

export default function Navbar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const session   = useSelector(s => s.auth.session)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    dispatch(resetBookings())
    navigate('/')
  }

  return (
    <nav className="bg-brand-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide flex items-center gap-2">
        ✈ SkyBook
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/" className="hover:text-brand-100 transition-colors">Search</Link>
        {session ? (
          <>
            <Link to="/my-bookings" className="hover:text-brand-100 transition-colors">My Bookings</Link>
            <button onClick={handleLogout} className="btn-secondary text-slate-800 text-xs py-1.5 px-3">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"  className="hover:text-brand-100 transition-colors">Login</Link>
            <Link to="/signup" className="btn-primary text-xs py-1.5 px-3">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
