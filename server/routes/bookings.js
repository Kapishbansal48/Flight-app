const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabase');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Helper: generate PNR code
const generatePNR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// GET /api/bookings — user's bookings
router.get('/', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('user_id', req.user.id)
    .order('booked_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/bookings — create a booking
router.post(
  '/',
  authenticate,
  [
    body('flight_id').notEmpty(),
    body('seat_id').notEmpty(),
    body('passenger.full_name').notEmpty(),
    body('passenger.passport_no').notEmpty(),
    body('passenger.nationality').notEmpty(),
    body('passenger.dob').isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { flight_id, seat_id, passenger } = req.body;
    const user_id = req.user.id;

    // 1. Get seat + flight details for price calculation
    const { data: seat, error: seatErr } = await supabase
      .from('seats')
      .select('*, flights(base_price)')
      .eq('id', seat_id)
      .single();

    if (seatErr || !seat) return res.status(404).json({ error: 'Seat not found' });
    if (!seat.is_available) return res.status(409).json({ error: 'Seat is no longer available' });

    const total_price = seat.flights.base_price + (seat.extra_fee || 0);
    const pnr_code = generatePNR();

    // 2. Insert booking
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({ user_id, flight_id, seat_id, status: 'confirmed', total_price, pnr_code })
      .select()
      .single();

    if (bookingErr) return res.status(500).json({ error: bookingErr.message });

    // 3. Reserve seat atomically via RPC
    const { data: reserved, error: rpcErr } = await supabase.rpc('reserve_seat', {
      p_seat_id: seat_id,
      p_booking_id: booking.id,
    });

    if (rpcErr || !reserved) {
      // Rollback booking if seat lock failed
      await supabase.from('bookings').delete().eq('id', booking.id);
      return res.status(409).json({ error: 'Seat was just taken. Please choose another.' });
    }

    // 4. Insert passenger details
    const { error: passengerErr } = await supabase
      .from('passengers')
      .insert({ booking_id: booking.id, ...passenger });

    if (passengerErr) return res.status(500).json({ error: passengerErr.message });

    res.status(201).json({ booking, pnr_code });
  }
);

// POST /api/bookings/:id/reschedule
router.post('/:id/reschedule', authenticate, async (req, res) => {
  const { new_flight_id, new_seat_id } = req.body;
  if (!new_flight_id || !new_seat_id) {
    return res.status(400).json({ error: 'new_flight_id and new_seat_id are required' });
  }

  // Get original booking
  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .select('*, flights(base_price), seats(extra_fee)')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (bErr || !booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status === 'cancelled') return res.status(400).json({ error: 'Cannot reschedule a cancelled booking' });

  // Get new seat/flight for price diff
  const { data: newSeat } = await supabase
    .from('seats')
    .select('*, flights(base_price)')
    .eq('id', new_seat_id)
    .single();

  const newTotal = newSeat.flights.base_price + (newSeat.extra_fee || 0);
  const fee_charged = Math.max(0, newTotal - booking.total_price);

  // Insert reschedule record
  const { error: reschedErr } = await supabase.from('reschedules').insert({
    booking_id: booking.id,
    old_flight_id: booking.flight_id,
    new_flight_id,
    fee_charged,
  });

  if (reschedErr) return res.status(500).json({ error: reschedErr.message });

  // Update booking
  const { data: updated, error: updateErr } = await supabase
    .from('bookings')
    .update({ flight_id: new_flight_id, seat_id: new_seat_id, status: 'rescheduled', total_price: newTotal })
    .eq('id', req.params.id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Free old seat
  await supabase.from('seats').update({ is_available: true }).eq('id', booking.seat_id);

  // Reserve new seat
  await supabase.rpc('reserve_seat', { p_seat_id: new_seat_id, p_booking_id: booking.id });

  res.json({ booking: updated, fee_charged });
});

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', authenticate, async (req, res) => {
  // DB trigger enforces 2-hour rule — we just call the RPC
  const { data, error } = await supabase.rpc('cancel_booking', {
    p_booking_id: req.params.id,
    p_user_id: req.user.id,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Booking cancelled' });
});

module.exports = router;
