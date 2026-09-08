-- =============================================================================
-- Migration: V24__enhance_slot_holds_with_status_and_request.sql
-- Description: Adds lifecycle status, service request link, and audit timestamps
--              to slot_holds to support multi-capacity reservations and booking history.
-- =============================================================================

ALTER TABLE slot_holds
    ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN service_request_id UUID,
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE slot_holds
    ADD CONSTRAINT fk_sh_service_request
    FOREIGN KEY (service_request_id) REFERENCES service_requests(service_request_id) ON DELETE SET NULL;

ALTER TABLE slot_holds
    ADD CONSTRAINT chk_sh_status
    CHECK (status IN ('ACTIVE', 'CONVERTED', 'RELEASED', 'EXPIRED'));

CREATE INDEX idx_sh_active_lookup
    ON slot_holds (service_date, time_slot, status, expires_at);

CREATE INDEX idx_sh_customer_active
    ON slot_holds (customer_id, status, expires_at);

CREATE INDEX idx_sr_date_slot_active
    ON service_requests (preferred_date, preferred_time_slot, status);

