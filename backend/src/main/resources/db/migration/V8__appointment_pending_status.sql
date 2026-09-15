UPDATE appointments
SET status = 'PENDING'
WHERE status = 'REQUESTED';

ALTER TABLE appointments
ALTER COLUMN status SET DEFAULT 'PENDING';
