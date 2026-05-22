import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export const searchFlights = createAsyncThunk(
  'flights/search',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/flights/search', { params })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Search failed')
    }
  }
)

export const fetchFlightById = createAsyncThunk(
  'flights/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/flights/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Not found')
    }
  }
)

const flightsSlice = createSlice({
  name: 'flights',
  initialState: {
    // Persist search query so user can resume
    searchQuery: JSON.parse(localStorage.getItem('flight-search') || 'null'),
    results: [],
    selectedFlight: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSearchQuery: (state, { payload }) => {
      state.searchQuery = payload
      localStorage.setItem('flight-search', JSON.stringify(payload))
    },
    setSelectedFlight: (state, { payload }) => {
      state.selectedFlight = payload
    },
    clearResults: (state) => {
      state.results = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(searchFlights.fulfilled, (state, { payload }) => {
        state.loading = false; state.results = payload
      })
      .addCase(searchFlights.rejected,  (state, { payload }) => {
        state.loading = false; state.error = payload
      })
      .addCase(fetchFlightById.fulfilled, (state, { payload }) => {
        state.selectedFlight = payload
      })
  },
})

export const { setSearchQuery, setSelectedFlight, clearResults } = flightsSlice.actions
export default flightsSlice.reducer
