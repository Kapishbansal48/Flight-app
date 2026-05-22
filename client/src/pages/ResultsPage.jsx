import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import FlightCard from '../components/flights/FlightCard'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { results, loading, error, searchQuery } = useSelector(s => s.flights)

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/')} className="text-brand-600 text-sm mb-4 hover:underline">
        ← Back to search
      </button>

      {searchQuery && (
        <h2 className="text-2xl font-bold mb-1">
          {searchQuery.origin} → {searchQuery.destination}
        </h2>
      )}
      {searchQuery && (
        <p className="text-slate-500 text-sm mb-6">
          {new Date(searchQuery.date).toDateString()} · {searchQuery.passengers} passenger{searchQuery.passengers > 1 ? 's' : ''}
        </p>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {results.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">
          <p className="text-lg">No flights found for this route and date.</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Try another search</button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(flight => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  )
}
