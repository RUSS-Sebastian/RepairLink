-- Seed staff roles
INSERT INTO roles (role_id, role_code, role_name, description)
VALUES
    ('33333333-3333-4333-8333-333333333333', 'CENTER_STAFF', 'Center Staff', 'Front-desk and center staff account'),
    ('44444444-4444-4444-8444-444444444444', 'MECHANIC', 'Mechanic', 'Workshop mechanic and technician account'),
    ('55555555-5555-4555-8555-555555555555', 'DELIVERY_STAFF', 'Delivery Driver', 'Vehicle pickup and delivery driver account')
ON CONFLICT (role_code) DO NOTHING;

-- Add username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username
    ON users (LOWER(username))
    WHERE username IS NOT NULL;

-- Make phone column nullable for staff accounts
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Replace strict phone unique constraint with partial unique index permitting NULLs
ALTER TABLE users DROP CONSTRAINT IF EXISTS uq_users_phone;
DROP INDEX IF EXISTS uq_users_phone;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone
    ON users (phone)
    WHERE phone IS NOT NULL;

