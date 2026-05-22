import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function ConfirmationPage() {
  const navigate     = useNavigate()
  const confirmation = useSelector(s => s.bookings.confirmation)

  if (!confirmation) {
    navigate('/')
    return null
  }

  const { booking, pnr_code } = confirmation

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
      <p className="text-slate-500 mb-8">Your flight has been booked successfully.</p>

      <div className="card mb-6 text-left space-y-3">
        <div className="text-center mb-4">
          <p className="text-sm text-slate-500 uppercase tracking-wide">PNR Code</p>
          <p className="text-4xl font-mono font-bold text-brand-700 tracking-widest">{pnr_code}</p>
          <p className="text-xs text-slate-400 mt-1">Save this code for check-in</p>
        </div>
        <hr className="border-slate-200" />
        <p><span className="font-medium">Booking ID:</span> <span className="text-xs text-slate-500 font-mono">{booking.id}</span></p>
        <p><span className="font-medium">Status:</span>
          <span className="badge bg-green-100 text-green-700 ml-2">{booking.status}</span>
        </p>
        <p><span className="font-medium">Total Paid:</span> ₹{booking.total_price?.toLocaleString()}</p>
        <p><span className="font-medium">Booked At:</span> {new Date(booking.booked_at).toLocaleString()}</p>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/my-bookings')} className="btn-primary">
          View My Bookings
        </button>
        <button onClick={() => navigate('/')} className="btn-secondary">
          Book Another
        </button>
      </div>
    </div>
  )
}
