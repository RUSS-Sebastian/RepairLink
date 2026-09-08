-- Service Requests
CREATE TABLE service_requests (
    service_request_id    UUID PRIMARY KEY,
    customer_id           UUID NOT NULL,
    vehicle_id            UUID NOT NULL,
    problem_description   TEXT NOT NULL,
    preferred_date        DATE NOT NULL,
    preferred_time_slot   VARCHAR(30) NOT NULL,
    handover_method       VARCHAR(20) NOT NULL DEFAULT 'DROP_OFF',
    pickup_location       VARCHAR(500),
    status                VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sr_customer FOREIGN KEY (customer_id) REFERENCES users(user_id),
    CONSTRAINT fk_sr_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    CONSTRAINT chk_sr_status CHECK (status IN (
        'PENDING_REVIEW','APPOINTMENT_SCHEDULED','CANCELLED','REJECTED','COMPLETED'
    )),
    CONSTRAINT chk_sr_handover CHECK (handover_method IN ('DROP_OFF','PICKUP')),
    CONSTRAINT chk_sr_pickup CHECK (
        handover_method <> 'PICKUP' OR pickup_location IS NOT NULL
    ),
    CONSTRAINT chk_sr_problem CHECK (LENGTH(TRIM(problem_description)) >= 10)
);

CREATE INDEX idx_sr_customer ON service_requests (customer_id);
CREATE INDEX idx_sr_vehicle ON service_requests (vehicle_id);
CREATE INDEX idx_sr_status ON service_requests (status);
CREATE INDEX idx_sr_date ON service_requests (preferred_date);

-- Service Request Photos
CREATE TABLE service_request_photos (
    photo_id              UUID PRIMARY KEY,
    service_request_id    UUID NOT NULL,
    original_file_name    VARCHAR(255) NOT NULL,
    stored_file_name      VARCHAR(255) NOT NULL,
    file_size             BIGINT NOT NULL,
    content_type          VARCHAR(100) NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_srp_request FOREIGN KEY (service_request_id)
        REFERENCES service_requests(service_request_id) ON DELETE CASCADE
);

CREATE INDEX idx_srp_request ON service_request_photos (service_request_id);

-- Service Request ↔ Additional Services join table
CREATE TABLE service_request_additional_services (
    service_request_id    UUID NOT NULL,
    additional_service_id UUID NOT NULL,
    PRIMARY KEY (service_request_id, additional_service_id),

    CONSTRAINT fk_sras_request FOREIGN KEY (service_request_id)
        REFERENCES service_requests(service_request_id) ON DELETE CASCADE,
    CONSTRAINT fk_sras_service FOREIGN KEY (additional_service_id)
        REFERENCES additional_services(additional_service_id)
);
