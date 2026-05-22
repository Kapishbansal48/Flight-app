import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export const fetchSeats = createAsyncThunk(
  'seats/fetch',
  async (flightId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/seats/${flightId}`)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load seats')
    }
  }
)

const seatsSlice = createSlice({
  name: 'seats',
  initialState: {
    seats: [],           // full seat map for current flight
    selectedSeat: null,  // optimistically selected seat
    loading: false,
    error: null,
  },
  reducers: {
    // Optimistic selection — UI updates instantly before Supabase confirms
    selectSeat: (state, { payload }) => {
      state.selectedSeat = payload
    },
    clearSelectedSeat: (state) => {
      state.selectedSeat = null
    },
    // Called when Supabase Realtime pushes a seat update
    updateSeatAvailability: (state, { payload }) => {
      const idx = state.seats.findIndex(s => s.id === payload.id)
      if (idx !== -1) state.seats[idx] = { ...state.seats[idx], ...payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeats.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchSeats.fulfilled, (state, { payload }) => {
        state.loading = false; state.seats = payload
      })
      .addCase(fetchSeats.rejected,  (state, { payload }) => {
        state.loading = false; state.error = payload
      })
  },
})

export const { selectSeat, clearSelectedSeat, updateSeatAvailability } = seatsSlice.actions
export default seatsSlice.reducer
