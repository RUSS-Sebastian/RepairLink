CREATE TABLE customer_loyalty_accounts (
    loyalty_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    total_points BIGINT NOT NULL DEFAULT 0,
    lifetime_points BIGINT NOT NULL DEFAULT 0,
    services_completed BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_loyalty_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_customer_loyalty_points
        CHECK (total_points >= 0 AND lifetime_points >= 0),
    CONSTRAINT chk_customer_loyalty_services
        CHECK (services_completed >= 0)
);

CREATE INDEX idx_customer_loyalty_total_points
    ON customer_loyalty_accounts (total_points);

CREATE TABLE loyalty_point_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    points_delta BIGINT NOT NULL,
    transaction_type VARCHAR(40) NOT NULL,
    description VARCHAR(255),
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_loyalty_transaction_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_loyalty_transaction_type
        CHECK (TRIM(transaction_type) <> '')
);

CREATE INDEX idx_loyalty_transactions_user_created
    ON loyalty_point_transactions (user_id, created_at DESC);

INSERT INTO customer_loyalty_accounts (user_id)
SELECT ur.user_id
FROM user_roles ur
JOIN roles r ON r.role_id = ur.role_id
JOIN users u ON u.user_id = ur.user_id
WHERE r.role_code = 'CUSTOMER'
  AND ur.is_active = TRUE
ON CONFLICT (user_id) DO NOTHING;
