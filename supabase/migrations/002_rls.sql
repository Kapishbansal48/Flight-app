-- Enable RLS on all tables
ALTER TABLE flights     ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- FLIGHTS: anyone can read
CREATE POLICY "flights_read_all" ON flights FOR SELECT USING (true);

-- SEATS: anyone can read
CREATE POLICY "seats_read_all" ON seats FOR SELECT USING (true);

-- BOOKINGS: users can only see their own
CREATE POLICY "bookings_read_own"   ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_insert_own" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update_own" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- PASSENGERS: via booking ownership
CREATE POLICY "passengers_read_own" ON passengers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bookings b WHERE b.id = passengers.booking_id AND b.user_id = auth.uid()
  ));
CREATE POLICY "passengers_insert_own" ON passengers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM bookings b WHERE b.id = passengers.booking_id AND b.user_id = auth.uid()
  ));

-- RESCHEDULES: via booking ownership
CREATE POLICY "reschedules_read_own" ON reschedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bookings b WHERE b.id = reschedules.booking_id AND b.user_id = auth.uid()
  ));
CREATE POLICY "reschedules_insert_own" ON reschedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM bookings b WHERE b.id = reschedules.booking_id AND b.user_id = auth.uid()
  ));
