CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    nickname VARCHAR(100) NOT NULL DEFAULT 'My Car',
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    model_year INTEGER NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    fuel_type VARCHAR(30),
    transmission VARCHAR(20),
    color VARCHAR(50) NOT NULL,
    current_mileage BIGINT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicles_owner
        FOREIGN KEY (owner_id) REFERENCES users(user_id),

    CONSTRAINT chk_vehicles_model_year
        CHECK (model_year >= 1900),

    CONSTRAINT chk_vehicles_mileage
        CHECK (current_mileage >= 0),

    CONSTRAINT chk_vehicles_type
        CHECK (vehicle_type IN ('NORMAL_CAR', 'EV')),

    CONSTRAINT chk_vehicles_fuel_type
        CHECK (fuel_type IS NULL OR fuel_type IN (
            'PETROL', 'DIESEL', 'HYBRID', 'PLUG_IN_HYBRID',
            'CNG', 'LPG', 'HYDROGEN_FUEL_CELL'
        )),

    CONSTRAINT chk_vehicles_transmission
        CHECK (transmission IS NULL OR transmission IN (
            'MANUAL', 'AUTOMATIC', 'CVT', 'DCT', 'AMT', 'E_CVT'
        )),

    CONSTRAINT chk_vehicles_powertrain_fields
        CHECK (
            (vehicle_type = 'EV' AND fuel_type IS NULL AND transmission IS NULL)
            OR
            (vehicle_type = 'NORMAL_CAR' AND fuel_type IS NOT NULL AND transmission IS NOT NULL)
        )
);

CREATE UNIQUE INDEX uq_vehicles_active_license_plate_ci
    ON vehicles (LOWER(license_plate))
    WHERE deleted_at IS NULL;

CREATE INDEX idx_vehicles_active_owner
    ON vehicles (owner_id)
    WHERE deleted_at IS NULL;

CREATE TABLE vehicle_plate_history (
    history_id UUID PRIMARY KEY,
    vehicle_id UUID NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_vehicle_plate_history_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

CREATE UNIQUE INDEX uq_vehicle_plate_history_current
    ON vehicle_plate_history (vehicle_id)
    WHERE is_current = TRUE;

CREATE INDEX idx_vehicle_plate_history_vehicle_changed
    ON vehicle_plate_history (vehicle_id, changed_at DESC);
