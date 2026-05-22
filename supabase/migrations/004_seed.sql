-- =============================================
-- SEED: 8 flights across 4 routes
-- Routes: DEL-BOM, BOM-DEL, DEL-BLR, BLR-DEL
-- =============================================

DO $$
DECLARE
  flight_ids UUID[];
  fid        UUID;
  row_num    INT;
  col        TEXT;
  seat_class TEXT;
  extra      NUMERIC;
  cols       TEXT[] := ARRAY['A','B','C','D','E','F'];
BEGIN

INSERT INTO flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('AI101', 'DEL', 'BOM', NOW() + INTERVAL '2 days',      NOW() + INTERVAL '2 days 2 hours',   'Airbus A320', 'scheduled', 4500),
  ('AI102', 'BOM', 'DEL', NOW() + INTERVAL '2 days 5 hours', NOW() + INTERVAL '2 days 7 hours','Airbus A320', 'scheduled', 4500),
  ('AI201', 'DEL', 'BLR', NOW() + INTERVAL '3 days',      NOW() + INTERVAL '3 days 3 hours',   'Boeing 737',  'scheduled', 5200),
  ('AI202', 'BLR', 'DEL', NOW() + INTERVAL '3 days 6 hours', NOW() + INTERVAL '3 days 9 hours','Boeing 737',  'scheduled', 5200),
  ('AI103', 'DEL', 'BOM', NOW() + INTERVAL '5 days',      NOW() + INTERVAL '5 days 2 hours',   'Airbus A320', 'scheduled', 4800),
  ('AI104', 'BOM', 'DEL', NOW() + INTERVAL '5 days 4 hours', NOW() + INTERVAL '5 days 6 hours','Airbus A320', 'scheduled', 4800),
  ('AI203', 'DEL', 'BLR', NOW() + INTERVAL '7 days',      NOW() + INTERVAL '7 days 3 hours',   'Boeing 737',  'scheduled', 5500),
  ('AI204', 'BLR', 'DEL', NOW() + INTERVAL '7 days 5 hours', NOW() + INTERVAL '7 days 8 hours','Boeing 737',  'scheduled', 5500);

-- Collect all inserted flight IDs into an array
SELECT ARRAY_AGG(id) INTO flight_ids FROM flights
WHERE flight_no IN ('AI101','AI102','AI201','AI202','AI103','AI104','AI203','AI204');

-- Loop over each flight
FOREACH fid IN ARRAY flight_ids LOOP
  FOR row_num IN 1..30 LOOP
    FOREACH col IN ARRAY cols LOOP

      -- First class: rows 1-2, seats A-D only
      IF row_num <= 2 THEN
        IF col IN ('A','B','C','D') THEN
          seat_class := 'first';
          extra := 3000;
        ELSE
          CONTINUE;
        END IF;

      -- Business: rows 3-5, all columns
      ELSIF row_num <= 5 THEN
        seat_class := 'business';
        extra := 1500;

      -- Economy: rows 6-30
      ELSE
        seat_class := 'economy';
        extra := 0;
      END IF;

      INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (fid, row_num::TEXT || col, seat_class, true, extra);

    END LOOP;
  END LOOP;
END LOOP;

END $$;
