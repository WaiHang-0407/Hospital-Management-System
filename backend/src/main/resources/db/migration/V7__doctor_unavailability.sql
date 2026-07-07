CREATE TABLE IF NOT EXISTS doctor_unavailability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    unavailable_date DATE NOT NULL,
    start_time TIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_unavailability_slot UNIQUE (doctor_id, unavailable_date, start_time)
);

CREATE INDEX IF NOT EXISTS idx_doctor_unavailability_doctor_date
ON doctor_unavailability(doctor_id, unavailable_date);
