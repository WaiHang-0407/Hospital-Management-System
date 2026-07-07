CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS department_members (
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    PRIMARY KEY (department_id, user_id)
);

INSERT INTO departments (name, description)
VALUES
    ('General Medicine', 'Primary diagnosis, consultations, and follow-up care'),
    ('Cardiology', 'Heart and cardiovascular services'),
    ('Pediatrics', 'Children and adolescent healthcare'),
    ('Orthopedics', 'Bone, joint, and musculoskeletal care'),
    ('Dermatology', 'Skin, hair, and nail care'),
    ('Emergency', 'Urgent and emergency care services')
ON CONFLICT (name) DO NOTHING;
