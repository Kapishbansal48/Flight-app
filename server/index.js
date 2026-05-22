const express = require('express');
const supabase = require('../supabase');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/seats/:flightId — full seat map for a flight
router.get('/:flightId', async (req, res) => {
  const { data, error } = await supabase
    .from('seats')
    .select('*')
    .eq('flight_id', req.params.flightId)
    .order('seat_number', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/seats/reserve — lock a seat using the RPC (prevents double-booking)
router.post('/reserve', authenticate, async (req, res) => {
  const { seat_id, booking_id } = req.body;
  if (!seat_id || !booking_id) {
    return res.status(400).json({ error: 'seat_id and booking_id are required' });
  }

  // Calls the Supabase RPC function that atomically marks seat as unavailable
  const { data, error } = await supabase.rpc('reserve_seat', {
    p_seat_id: seat_id,
    p_booking_id: booking_id,
  });

  if (error) return res.status(409).json({ error: error.message });
  if (!data) return res.status(409).json({ error: 'Seat already taken' });

  res.json({ success: true });
});

module.exports = router;
