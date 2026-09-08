-- Create sequence for service request codes starting at 1001
CREATE SEQUENCE service_request_code_seq START WITH 1001 INCREMENT BY 1;

-- Add request_code column (temporarily nullable for backfill)
ALTER TABLE service_requests
    ADD COLUMN request_code VARCHAR(30);

-- Backfill any existing service requests in order of creation
UPDATE service_requests
SET request_code = 'REQ-' || LPAD(NEXTVAL('service_request_code_seq')::TEXT, 4, '0')
WHERE request_code IS NULL;

-- Enforce NOT NULL, DEFAULT, and UNIQUE constraint
ALTER TABLE service_requests
    ALTER COLUMN request_code SET NOT NULL,
    ALTER COLUMN request_code SET DEFAULT ('REQ-' || LPAD(NEXTVAL('service_request_code_seq')::TEXT, 4, '0')),
    ADD CONSTRAINT uq_service_requests_code UNIQUE (request_code);

-- Create index for fast lookups by request code
CREATE INDEX idx_service_requests_code ON service_requests (request_code);

