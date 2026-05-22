const express = require('express');
const { query, validationResult } = require('express-validator');
const supabase = require('../supabase');

const router = express.Router();

// GET /api/flights/search?origin=DEL&destination=BOM&date=2024-06-01&passengers=1
router.get(
  '/search',
  [
    query('origin').notEmpty(),
    query('destination').notEmpty(),
    query('date').isISO8601(),
    query('passengers').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { origin, destination, date } = req.query;

    // Match flights departing on the given date
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('origin', origin.toUpperCase())
      .eq('destination', destination.toUpperCase())
      .gte('departs_at', startOfDay)
      .lte('departs_at', endOfDay)
      .eq('status', 'scheduled');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
);

// GET /api/flights/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Flight not found' });
  res.json(data);
});

// GET /api/flights — list all (admin/seed check)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .order('departs_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
