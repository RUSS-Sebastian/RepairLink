CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_account_status
        CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

CREATE TABLE roles (
    role_id UUID PRIMARY KEY,
    role_code VARCHAR(30) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),

    CONSTRAINT uq_roles_role_code UNIQUE (role_code)
);

CREATE TABLE user_roles (
    user_role_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    active_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(user_id),

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id),

    CONSTRAINT chk_user_roles_active_dates
        CHECK (active_to IS NULL OR active_to >= active_from)
);

CREATE UNIQUE INDEX uq_user_roles_active_assignment
    ON user_roles (user_id, role_id)
    WHERE is_active = TRUE;

INSERT INTO roles (
    role_id,
    role_code,
    role_name,
    description
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'CUSTOMER',
    'Customer',
    'Customer-facing RepairLink account role'
);