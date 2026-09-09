-- V30: Create appointments sequence and table
CREATE SEQUENCE IF NOT EXISTS appointment_code_seq START WITH 3407 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_code VARCHAR(30) NOT NULL UNIQUE DEFAULT ('APT-' || LPAD(NEXTVAL('appointment_code_seq')::TEXT, 4, '0')),
    service_request_id UUID NOT NULL REFERENCES service_requests(service_request_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    handover_method VARCHAR(20) NOT NULL,
    pickup_location TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    cancellation_reason TEXT,
    cancelled_by VARCHAR(50),
    cancelled_at TIMESTAMPTZ,
    confirmed_by VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments (customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_request ON appointments (service_request_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_code ON appointments (appointment_code);
