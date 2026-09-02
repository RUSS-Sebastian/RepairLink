DROP INDEX uq_vehicles_active_license_plate_ci;

CREATE UNIQUE INDEX uq_vehicles_license_plate_ci
    ON vehicles (LOWER(license_plate));
