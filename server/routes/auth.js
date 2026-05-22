const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../supabase');

const router = express.Router();

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ user: data.user, session: data.session });
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });

    res.json({ user: data.user, session: data.session });
  }
);

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  await supabase.auth.signOut();
  res.json({ message: 'Logged out' });
});

module.exports = router;
