import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSeat, updateSeatAvailability } from '../../store/slices/seatsSlice'
import { supabase } from '../../lib/supabase'

const CLASS_COLORS = {
  first:    { base: 'bg-yellow-100 border-yellow-400 text-yellow-800', selected: 'bg-yellow-500 border-yellow-600 text-white' },
  business: { base: 'bg-blue-100 border-blue-400 text-blue-800',      selected: 'bg-blue-500 border-blue-600 text-white' },
  economy:  { base: 'bg-green-100 border-green-400 text-green-800',   selected: 'bg-green-500 border-green-600 text-white' },
}

const CLASS_LABELS = { first: '🥇 First Class', business: '💼 Business', economy: '🪑 Economy' }

export default function SeatMap({ flightId }) {
  const dispatch     = useDispatch()
  const { seats, selectedSeat } = useSelector(s => s.seats)

  // Subscribe to Supabase Realtime for live seat updates
  useEffect(() => {
    if (!flightId) return
    const channel = supabase
      .channel(`seats:${flightId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'seats',
        filter: `flight_id=eq.${flightId}`,
      }, (payload) => {
        dispatch(updateSeatAvailability(payload.new))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [flightId, dispatch])

  // Group seats by class, then by row
  const grouped = seats.reduce((acc, seat) => {
    if (!acc[seat.class]) acc[seat.class] = {}
    const row = seat.seat_number.replace(/[A-Z]/g, '')
    if (!acc[seat.class][row]) acc[seat.class][row] = []
    acc[seat.class][row].push(seat)
    return acc
  }, {})

  const classes = ['first', 'business', 'economy'].filter(c => grouped[c])

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border bg-green-100 border-green-400 inline-block"/> Available</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border bg-slate-200 border-slate-400 inline-block"/> Occupied</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border bg-brand-500 border-brand-600 inline-block"/> Selected</span>
      </div>

      {classes.map(cls => (
        <div key={cls}>
          <h3 className="font-semibold text-sm text-slate-600 mb-2 uppercase tracking-wide">{CLASS_LABELS[cls]}</h3>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full space-y-1">
              {Object.entries(grouped[cls]).map(([row, rowSeats]) => (
                <div key={row} className="flex gap-1 items-center">
                  <span className="w-6 text-xs text-slate-400 text-right mr-1">{row}</span>
                  {rowSeats.sort((a, b) => a.seat_number.localeCompare(b.seat_number)).map((seat, i) => {
                    const isSelected  = selectedSeat?.id === seat.id
                    const isOccupied  = !seat.is_available

                    let classes = 'w-9 h-9 rounded border text-xs font-medium transition-all flex items-center justify-center cursor-pointer '
                    if (isOccupied) {
                      classes += 'bg-slate-200 border-slate-400 text-slate-400 cursor-not-allowed'
                    } else if (isSelected) {
                      classes += 'bg-brand-500 border-brand-600 text-white scale-110 shadow-md'
                    } else {
                      const c = CLASS_COLORS[seat.class]
                      classes += `${c.base} hover:scale-105 hover:shadow`
                    }

                    // Add aisle gap after seat C
                    const col = seat.seat_number.replace(/\d/g, '')
                    const addGap = col === 'C'

                    return (
                      <div key={seat.id} className={`flex items-center ${addGap ? 'mr-3' : ''}`}>
                        <button
                          title={isOccupied
                            ? `Occupied · ${seat.class} · +₹${seat.extra_fee}`
                            : `${seat.seat_number} · ${seat.class} · +₹${seat.extra_fee}`
                          }
                          disabled={isOccupied}
                          onClick={() => !isOccupied && dispatch(selectSeat(isSelected ? null : seat))}
                          className={classes}
                        >
                          {seat.seat_number.replace(/\d/g, '')}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
