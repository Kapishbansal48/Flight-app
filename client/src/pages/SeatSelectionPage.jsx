import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSeats } from '../store/slices/seatsSlice'
import { setBookingDraft } from '../store/slices/bookingsSlice'
import SeatMap from '../components/seats/SeatMap'

export default function SeatSelectionPage() {
  const { flightId } = useParams()
  const dispatch     = useDispatch()
  const navigate     = useNavigate()
  const { seats, selectedSeat, loading } = useSelector(s => s.seats)
  const selectedFlight = useSelector(s => s.flights.selectedFlight)

  useEffect(() => {
    dispatch(fetchSeats(flightId))
  }, [flightId, dispatch])

  const handleContinue = () => {
    dispatch(setBookingDraft({
      flight_id: flightId,
      seat_id: selectedSeat.id,
      seat_number: selectedSeat.seat_number,
      seat_class: selectedSeat.class,
      extra_fee: selectedSeat.extra_fee,
    }))
    navigate(`/book/${flightId}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-brand-600 text-sm mb-4 hover:underline">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-1">Select Your Seat</h2>
      {selectedFlight && (
        <p className="text-slate-500 text-sm mb-6">
          {selectedFlight.flight_no} · {selectedFlight.origin} → {selectedFlight.destination}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="card overflow-y-auto max-h-[60vh] mb-6">
          <SeatMap flightId={flightId} />
        </div>
      )}

      {selectedSeat && (
        <div className="card flex items-center justify-between bg-brand-50 border-brand-200">
          <div>
            <p className="font-semibold">Seat {selectedSeat.seat_number}</p>
            <p className="text-sm text-slate-500 capitalize">{selectedSeat.class} · +₹{selectedSeat.extra_fee}</p>
          </div>
          <button onClick={handleContinue} className="btn-primary">
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}
