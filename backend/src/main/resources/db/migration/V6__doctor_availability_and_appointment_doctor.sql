ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_time
ON appointments(doctor_id, appointment_date, appointment_time);

CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_availability_slot UNIQUE (doctor_id, available_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_date
ON doctor_availability(doctor_id, available_date);
