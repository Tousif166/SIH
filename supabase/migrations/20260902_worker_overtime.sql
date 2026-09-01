-- Worker Overtime Enforcement Migration
-- Rules: 
-- 1. A worker cannot be assigned a new job if they have worked > 60 hours in the last 7 days.
-- 2. "Overwork" can be done if and only if 'overtime_consent' is true for that specific booking/worker.

-- Create a table for worker hours log if it doesn't exist
CREATE TABLE IF NOT EXISTS worker_timesheets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  hours_worked decimal(5,2) NOT NULL,
  date_worked date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Function to check overtime before inserting a booking assignment
CREATE OR REPLACE FUNCTION check_worker_overtime()
RETURNS trigger AS $$
DECLARE
  total_hours decimal(5,2);
  has_consent boolean;
BEGIN
  -- We only check when a worker is assigned
  IF NEW.worker_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.worker_id IS DISTINCT FROM NEW.worker_id) THEN
    
    -- Calculate total hours in the last 7 days
    SELECT COALESCE(SUM(hours_worked), 0) INTO total_hours
    FROM worker_timesheets
    WHERE worker_id = NEW.worker_id
      AND date_worked >= CURRENT_DATE - INTERVAL '7 days';
      
    -- Assume standard job is 4 hours if not specified
    total_hours := total_hours + 4.0;
    
    -- Check if it exceeds 60 hours
    IF total_hours > 60.0 THEN
      -- Check if there's explicit consent for overtime in metadata (JSONB)
      -- Assuming booking table has a 'metadata' jsonb column
      has_consent := (NEW.metadata->>'overtime_consent')::boolean;
      
      IF NOT COALESCE(has_consent, false) THEN
        RAISE EXCEPTION 'Worker has exceeded maximum weekly hours (60) and no overtime consent provided.';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before assigning a booking
DROP TRIGGER IF EXISTS enforce_worker_overtime ON bookings;
CREATE TRIGGER enforce_worker_overtime
  BEFORE INSERT OR UPDATE OF worker_id
  ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_worker_overtime();
