ALTER TABLE vehicles
    ADD COLUMN mileage_unit VARCHAR(2) NOT NULL DEFAULT 'MI';

ALTER TABLE vehicles
    ADD CONSTRAINT chk_vehicles_mileage_unit
    CHECK (mileage_unit IN ('MI', 'KM'));
