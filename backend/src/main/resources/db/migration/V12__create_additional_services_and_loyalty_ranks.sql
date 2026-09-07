CREATE TABLE additional_services (
    additional_service_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price NUMERIC(15,2) NOT NULL,
    applicability VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,

    CONSTRAINT chk_additional_services_name
        CHECK (TRIM(name) <> ''),
    CONSTRAINT chk_additional_services_price
        CHECK (price >= 0),
    CONSTRAINT chk_additional_services_applicability
        CHECK (applicability IN ('NORMAL_CAR', 'EV', 'BOTH')),
    CONSTRAINT chk_additional_services_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    CONSTRAINT chk_additional_services_archive_time
        CHECK (
            (status = 'ARCHIVED' AND archived_at IS NOT NULL)
            OR (status <> 'ARCHIVED' AND archived_at IS NULL)
        ),
    CONSTRAINT fk_additional_services_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_additional_services_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX uq_additional_services_name_ci
    ON additional_services (LOWER(name));

CREATE INDEX idx_additional_services_status
    ON additional_services (status);

CREATE INDEX idx_additional_services_applicability
    ON additional_services (applicability);

CREATE TABLE loyalty_ranks (
    loyalty_rank_id UUID PRIMARY KEY,
    rank_name VARCHAR(60) NOT NULL,
    minimum_points BIGINT NOT NULL,
    maximum_points BIGINT NOT NULL,
    discount_percentage NUMERIC(5,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_loyalty_ranks_points
        CHECK (minimum_points >= 0 AND maximum_points >= minimum_points),
    CONSTRAINT chk_loyalty_ranks_discount
        CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    CONSTRAINT chk_loyalty_ranks_protected
        CHECK (NOT is_protected OR (minimum_points = 0 AND is_active)),
    CONSTRAINT fk_loyalty_ranks_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_loyalty_ranks_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT ex_loyalty_ranks_configured_ranges
        EXCLUDE USING GIST (
            int8range(minimum_points, maximum_points, '[]') WITH &&
        ) DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX uq_loyalty_ranks_name_ci
    ON loyalty_ranks (LOWER(rank_name));

CREATE UNIQUE INDEX uq_loyalty_ranks_one_protected
    ON loyalty_ranks (is_protected)
    WHERE is_protected = TRUE;

CREATE INDEX idx_loyalty_ranks_minimum_points
    ON loyalty_ranks (minimum_points);

CREATE INDEX idx_loyalty_ranks_active
    ON loyalty_ranks (is_active);
