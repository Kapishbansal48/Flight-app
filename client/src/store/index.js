import { configureStore } from '@reduxjs/toolkit'
import authReducer    from './slices/authSlice'
import flightsReducer from './slices/flightsSlice'
import seatsReducer   from './slices/seatsSlice'
import bookingsReducer from './slices/bookingsSlice'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    flights:  flightsReducer,
    seats:    seatsReducer,
    bookings: bookingsReducer,
  },
})

export default store
