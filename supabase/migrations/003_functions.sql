-- RPC: reserve_seat — atomically marks a seat as unavailable (prevents race conditions)
CREATE OR REPLACE FUNCTION reserve_seat(p_seat_id UUID, p_booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_available BOOLEAN;
BEGIN
  -- Lock the row for update
  SELECT is_available INTO v_available
  FROM seats
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT v_available THEN
    RETURN FALSE;
  END IF;

  UPDATE seats SET is_available = false WHERE id = p_seat_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: cancel_booking — atomically cancels booking and frees the seat
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_departs_at TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'Booking is already cancelled';
  END IF;

  SELECT departs_at INTO v_departs_at FROM flights WHERE id = v_booking.flight_id;

  -- Enforce 2-hour cancellation rule at DB level
  IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
    RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure';
  END IF;

  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;
  UPDATE seats SET is_available = true WHERE id = v_booking.seat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: also enforce 2-hour rule on direct UPDATE (belt-and-suspenders)
CREATE OR REPLACE FUNCTION check_cancellation_window()
RETURNS TRIGGER AS $$
DECLARE
  v_departs_at TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO v_departs_at FROM flights WHERE id = NEW.flight_id;
    IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION 'Cancellations not allowed within 2 hours of departure';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_cancellation_window
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION check_cancellation_window();
