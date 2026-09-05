CREATE TABLE parts (
    part_id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    part_number VARCHAR(30) NOT NULL,
    description VARCHAR(1000),
    supplier_name VARCHAR(150),
    warranty_months SMALLINT NOT NULL DEFAULT 0,
    price NUMERIC(12,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 15,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,

    CONSTRAINT uq_parts_part_number
        UNIQUE (part_number),

    CONSTRAINT chk_parts_name_not_blank
        CHECK (TRIM(name) <> ''),

    CONSTRAINT chk_parts_brand_not_blank
        CHECK (TRIM(brand) <> ''),

    CONSTRAINT chk_parts_part_number_format
        CHECK (part_number ~ '^[A-Z]{2,4}-[A-Z]{2}-[A-Z0-9]{4,6}$'),

    CONSTRAINT chk_parts_warranty_months
        CHECK (warranty_months >= 0),

    CONSTRAINT chk_parts_price
        CHECK (price > 0),

    CONSTRAINT chk_parts_stock_quantity
        CHECK (stock_quantity >= 0),

    CONSTRAINT chk_parts_reorder_level
        CHECK (reorder_level >= 0),

    CONSTRAINT chk_parts_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),

    CONSTRAINT fk_parts_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_parts_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE INDEX idx_parts_status
    ON parts (status);

CREATE INDEX idx_parts_active
    ON parts (name)
    WHERE status = 'ACTIVE';
