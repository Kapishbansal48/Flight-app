import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { searchFlights, setSearchQuery } from '../store/slices/flightsSlice'

const AIRPORTS = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD']

export default function SearchPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const savedQuery = useSelector(s => s.flights.searchQuery)

  const [form, setForm] = useState({
    origin:      savedQuery?.origin      || '',
    destination: savedQuery?.destination || '',
    date:        savedQuery?.date        || '',
    passengers:  savedQuery?.passengers  || 1,
  })

  const [error, setError] = useState('')

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.origin === form.destination) {
      return setError('Origin and destination cannot be the same.')
    }
    dispatch(setSearchQuery(form))
    await dispatch(searchFlights(form))
    navigate('/results')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-brand-900 mb-2 text-center">Find Your Flight</h1>
        <p className="text-center text-slate-500 mb-8">Search, book, and manage flights in one place.</p>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <select name="origin" value={form.origin} onChange={handleChange} required className="input">
                <option value="">Select origin</option>
                {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <select name="destination" value={form.destination} onChange={handleChange} required className="input">
                <option value="">Select destination</option>
                {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required
                min={new Date().toISOString().split('T')[0]} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Passengers</label>
              <input type="number" name="passengers" value={form.passengers} onChange={handleChange}
                min={1} max={9} required className="input" />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full py-3 text-base">
            🔍 Search Flights
          </button>
        </form>
      </div>
    </div>
  )
}
