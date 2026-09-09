ALTER TABLE service_requests
    ADD COLUMN cancellation_reason TEXT,
    ADD COLUMN cancelled_by VARCHAR(50);

CREATE INDEX idx_service_requests_status ON service_requests (status);
