import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { cancelBooking } from '../../store/slices/bookingsSlice'

const STATUS_BADGE = {
  confirmed:   'bg-green-100 text-green-700',
  rescheduled: 'bg-blue-100 text-blue-700',
  cancelled:   'bg-red-100 text-red-600',
}

const formatDT = (iso) => new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

export default function BookingCard({ booking }) {
  const dispatch   = useDispatch()
  const [confirm, setConfirm] = useState(false)
  const [error, setError]     = useState('')

  const { flights: flight, seats: seat, passengers } = booking
  const passenger = passengers?.[0]

  const handleCancel = async () => {
    const result = await dispatch(cancelBooking(booking.id))
    if (cancelBooking.rejected.match(result)) {
      setError(result.payload)
    }
    setConfirm(false)
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xl font-bold text-brand-700">{booking.pnr_code}</p>
          <p className="text-sm text-slate-500">{flight?.flight_no} · {flight?.origin} → {flight?.destination}</p>
        </div>
        <span className={`badge ${STATUS_BADGE[booking.status] || 'bg-slate-100 text-slate-600'}`}>
          {booking.status}
        </span>
      </div>

      <div className="text-sm text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1">
        <p><span className="font-medium">Departs:</span> {formatDT(flight?.departs_at)}</p>
        <p><span className="font-medium">Seat:</span> {seat?.seat_number} ({seat?.class})</p>
        <p><span className="font-medium">Passenger:</span> {passenger?.full_name}</p>
        <p><span className="font-medium">Paid:</span> ₹{booking.total_price?.toLocaleString()}</p>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      {booking.status !== 'cancelled' && (
        confirm ? (
          <div className="flex gap-2 items-center">
            <p className="text-sm text-red-600 flex-1">Cancel this booking?</p>
            <button onClick={handleCancel} className="btn-danger text-xs py-1.5 px-3">Yes, cancel</button>
            <button onClick={() => { setConfirm(false); setError('') }} className="btn-secondary text-xs py-1.5 px-3">No</button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} className="text-red-500 hover:text-red-700 text-sm underline text-left">
            Cancel booking
          </button>
        )
      )}
    </div>
  )
}
