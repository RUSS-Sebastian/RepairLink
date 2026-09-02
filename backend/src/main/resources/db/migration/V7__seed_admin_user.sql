-- Ensure the admin role exists without duplicating data if someone already created it manually.
INSERT INTO roles (
    role_id,
    role_code,
    role_name,
    description
)
VALUES (
    '22222222-2222-4222-8222-222222222222',
    'ADMIN',
    'Admin',
    'Administrator role used for the admin console'
)
ON CONFLICT (role_code) DO NOTHING;

-- Ensure a default admin user exists for team testing.
INSERT INTO users (
    user_id,
    full_name,
    email,
    phone,
    password_hash,
    account_status,
    created_at,
    updated_at
)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'RUSS',
    'russalejandro39@gmail.com',
    '0000000000',
    '$2a$10$VWfNxjqo7PNB1kMGxUxm6eUw7e4ZmIoSsnDIEqNablOMPOd7wYvNW',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE
SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    account_status = EXCLUDED.account_status,
    updated_at = CURRENT_TIMESTAMP;

-- Attach the admin role to the seed user if it is not already active.
INSERT INTO user_roles (
    user_role_id,
    user_id,
    role_id,
    active_from,
    active_to,
    is_active
)
SELECT
    gen_random_uuid(),
    u.user_id,
    r.role_id,
    CURRENT_TIMESTAMP,
    NULL,
    TRUE
FROM users u
JOIN roles r ON r.role_code = 'ADMIN'
WHERE u.email = 'russalejandro39@gmail.com'
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = u.user_id
        AND ur.role_id = r.role_id
        AND ur.is_active = TRUE
  );