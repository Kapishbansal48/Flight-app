-- =============================================
-- SEED: 8 flights across 4 routes
-- Routes: DEL-BOM, BOM-DEL, DEL-BLR, BLR-DEL
-- =============================================

DO $$
DECLARE
  f1 UUID; f2 UUID; f3 UUID; f4 UUID;
  f5 UUID; f6 UUID; f7 UUID; f8 UUID;
  row_num INT;
  col CHAR;
  seat_class TEXT;
  extra NUMERIC;
BEGIN

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  (uuid_generate_v4(), 'AI101', 'DEL', 'BOM', NOW() + INTERVAL '2 days',    NOW() + INTERVAL '2 days 2 hours',   'Airbus A320', 'scheduled', 4500),
  (uuid_generate_v4(), 'AI102', 'BOM', 'DEL', NOW() + INTERVAL '2 days 5h', NOW() + INTERVAL '2 days 7 hours',   'Airbus A320', 'scheduled', 4500),
  (uuid_generate_v4(), 'AI201', 'DEL', 'BLR', NOW() + INTERVAL '3 days',    NOW() + INTERVAL '3 days 3 hours',   'Boeing 737',  'scheduled', 5200),
  (uuid_generate_v4(), 'AI202', 'BLR', 'DEL', NOW() + INTERVAL '3 days 6h', NOW() + INTERVAL '3 days 9 hours',   'Boeing 737',  'scheduled', 5200),
  (uuid_generate_v4(), 'AI103', 'DEL', 'BOM', NOW() + INTERVAL '5 days',    NOW() + INTERVAL '5 days 2 hours',   'Airbus A320', 'scheduled', 4800),
  (uuid_generate_v4(), 'AI104', 'BOM', 'DEL', NOW() + INTERVAL '5 days 4h', NOW() + INTERVAL '5 days 6 hours',   'Airbus A320', 'scheduled', 4800),
  (uuid_generate_v4(), 'AI203', 'DEL', 'BLR', NOW() + INTERVAL '7 days',    NOW() + INTERVAL '7 days 3 hours',   'Boeing 737',  'scheduled', 5500),
  (uuid_generate_v4(), 'AI204', 'BLR', 'DEL', NOW() + INTERVAL '7 days 5h', NOW() + INTERVAL '7 days 8 hours',   'Boeing 737',  'scheduled', 5500)
RETURNING id INTO f1;

-- Grab all 8 flight IDs
SELECT id INTO f1 FROM flights WHERE flight_no = 'AI101';
SELECT id INTO f2 FROM flights WHERE flight_no = 'AI102';
SELECT id INTO f3 FROM flights WHERE flight_no = 'AI201';
SELECT id INTO f4 FROM flights WHERE flight_no = 'AI202';
SELECT id INTO f5 FROM flights WHERE flight_no = 'AI103';
SELECT id INTO f6 FROM flights WHERE flight_no = 'AI104';
SELECT id INTO f7 FROM flights WHERE flight_no = 'AI203';
SELECT id INTO f8 FROM flights WHERE flight_no = 'AI204';

-- Generate seat maps for each flight
-- Rows 1-2: First class (A-D), Rows 3-5: Business (A-F), Rows 6-30: Economy (A-F)
FOR fid IN
  SELECT unnest(ARRAY[f1, f2, f3, f4, f5, f6, f7, f8])
LOOP
  FOR row_num IN 1..30 LOOP
    FOREACH col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      -- First class: rows 1-2, only A-D
      IF row_num <= 2 THEN
        IF col IN ('A','B','C','D') THEN
          seat_class := 'first';
          extra := 3000;
        ELSE
          CONTINUE;
        END IF;
      -- Business: rows 3-5
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
