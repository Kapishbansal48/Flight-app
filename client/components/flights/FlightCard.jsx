import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setSelectedFlight } from '../../store/slices/flightsSlice'

const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const formatDuration = (dep, arr) => {
  const mins = Math.round((new Date(arr) - new Date(dep)) / 60000)
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function FlightCard({ flight }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSelect = () => {
    dispatch(setSelectedFlight(flight))
    navigate(`/seats/${flight.id}`)
  }

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-bold text-lg text-brand-700">{flight.flight_no}</span>
          <span className="badge bg-green-100 text-green-700">{flight.status}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 text-sm">
          <span className="font-semibold text-base">{formatTime(flight.departs_at)}</span>
          <span className="text-slate-400">{flight.origin}</span>
          <span className="flex-1 border-t border-dashed border-slate-300 mx-1" />
          <span className="text-slate-400 text-xs">{formatDuration(flight.departs_at, flight.arrives_at)}</span>
          <span className="flex-1 border-t border-dashed border-slate-300 mx-1" />
          <span className="text-slate-400">{flight.destination}</span>
          <span className="font-semibold text-base">{formatTime(flight.arrives_at)}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{flight.aircraft_type}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-2xl font-bold text-brand-600">₹{flight.base_price.toLocaleString()}</p>
        <p className="text-xs text-slate-400">base fare</p>
        <button onClick={handleSelect} className="btn-primary text-sm py-2 px-4">
          Select →
        </button>
      </div>
    </div>
  )
}
