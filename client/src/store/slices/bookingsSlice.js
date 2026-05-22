import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/bookings', payload)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Booking failed')
    }
  }
)

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bookings')
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load bookings')
    }
  }
)

export const rescheduleBooking = createAsyncThunk(
  'bookings/reschedule',
  async ({ bookingId, new_flight_id, new_seat_id }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/bookings/${bookingId}/reschedule`, { new_flight_id, new_seat_id })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Reschedule failed')
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      await api.post(`/bookings/${bookingId}/cancel`)
      return bookingId
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Cancellation failed')
    }
  }
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    // In-progress booking — persisted so user can resume after tab close
    inProgress: JSON.parse(localStorage.getItem('booking-draft') || 'null'),
    confirmation: null,   // last completed booking (PNR etc.)
    loading: false,
    error: null,
  },
  reducers: {
    setBookingDraft: (state, { payload }) => {
      state.inProgress = payload
      // Exclude passport_no from localStorage (sensitive)
      if (payload) {
        const safe = { ...payload }
        if (safe.passenger) {
          const { passport_no, ...safePassenger } = safe.passenger
          safe.passenger = safePassenger
        }
        localStorage.setItem('booking-draft', JSON.stringify(safe))
      } else {
        localStorage.removeItem('booking-draft')
      }
    },
    clearBookingDraft: (state) => {
      state.inProgress = null
      localStorage.removeItem('booking-draft')
    },
    clearConfirmation: (state) => { state.confirmation = null },
    clearError: (state) => { state.error = null },
    // Reset on cancel or logout
    resetBookings: (state) => {
      state.list = []
      state.inProgress = null
      state.confirmation = null
      localStorage.removeItem('booking-draft')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(createBooking.fulfilled, (state, { payload }) => {
        state.loading = false
        state.confirmation = payload
        state.inProgress = null
        localStorage.removeItem('booking-draft')
      })
      .addCase(createBooking.rejected,  (state, { payload }) => {
        state.loading = false; state.error = payload
      })
      .addCase(fetchMyBookings.pending,   (state) => { state.loading = true })
      .addCase(fetchMyBookings.fulfilled, (state, { payload }) => {
        state.loading = false; state.list = payload
      })
      .addCase(fetchMyBookings.rejected,  (state, { payload }) => {
        state.loading = false; state.error = payload
      })
      .addCase(rescheduleBooking.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(b => b.id === payload.booking.id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...payload.booking }
      })
      .addCase(cancelBooking.fulfilled, (state, { payload: bookingId }) => {
        const idx = state.list.findIndex(b => b.id === bookingId)
        if (idx !== -1) state.list[idx].status = 'cancelled'
      })
      .addCase(cancelBooking.rejected, (state, { payload }) => {
        state.error = payload
      })
  },
})

export const { setBookingDraft, clearBookingDraft, clearConfirmation, clearError, resetBookings } = bookingsSlice.actions
export default bookingsSlice.reducer
