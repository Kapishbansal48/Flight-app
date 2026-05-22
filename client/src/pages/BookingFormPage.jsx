import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createBooking, setBookingDraft } from '../store/slices/bookingsSlice'

export default function BookingFormPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const draft     = useSelector(s => s.bookings.inProgress)
  const { loading, error } = useSelector(s => s.bookings)
  const selectedFlight = useSelector(s => s.flights.selectedFlight)

  const [passenger, setPassenger] = useState({
    full_name:   '',
    passport_no: '',
    nationality: '',
    dob:         '',
  })

  if (!draft) {
    navigate('/')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setPassenger(p => ({ ...p, [name]: value }))
    // Persist draft (passport excluded from storage — done in slice)
    dispatch(setBookingDraft({ ...draft, passenger: { ...passenger, [name]: value } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(createBooking({
      flight_id: draft.flight_id,
      seat_id:   draft.seat_id,
      passenger,
    }))
    if (createBooking.fulfilled.match(result)) {
      navigate('/confirmation')
    }
  }

  const totalPrice = (selectedFlight?.base_price || 0) + (draft.extra_fee || 0)

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-brand-600 text-sm mb-4 hover:underline">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>

      {/* Booking summary */}
      <div className="card bg-brand-50 border-brand-200 mb-6 text-sm space-y-1">
        <p><span className="font-medium">Flight:</span> {selectedFlight?.flight_no} — {selectedFlight?.origin} → {selectedFlight?.destination}</p>
        <p><span className="font-medium">Seat:</span> {draft.seat_number} ({draft.seat_class})</p>
        <p><span className="font-medium">Total:</span> ₹{totalPrice.toLocaleString()}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input name="full_name" value={passenger.full_name} onChange={handleChange}
            required className="input" placeholder="As per passport" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Passport Number</label>
          <input name="passport_no" value={passenger.passport_no} onChange={handleChange}
            required className="input" placeholder="A1234567" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nationality</label>
          <input name="nationality" value={passenger.nationality} onChange={handleChange}
            required className="input" placeholder="Indian" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input type="date" name="dob" value={passenger.dob} onChange={handleChange}
            required className="input" />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Confirming...' : '✅ Confirm Booking'}
        </button>
      </form>
    </div>
  )
}
