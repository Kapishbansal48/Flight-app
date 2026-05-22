import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyBookings } from '../store/slices/bookingsSlice'
import BookingCard from '../components/bookings/BookingCard'

export default function MyBookingsPage() {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector(s => s.bookings)

  useEffect(() => {
    dispatch(fetchMyBookings())
  }, [dispatch])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && list.length === 0 && (
        <div className="card text-center text-slate-500 py-12">
          <p className="text-lg">No bookings yet.</p>
          <a href="/" className="btn-primary inline-block mt-4">Search Flights</a>
        </div>
      )}

      <div className="space-y-4">
        {list.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  )
}
