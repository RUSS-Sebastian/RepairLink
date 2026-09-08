-- Temporary slot holds for appointment reservations
CREATE TABLE slot_holds (
    hold_id       UUID PRIMARY KEY,
    customer_id   UUID NOT NULL,
    service_date  DATE NOT NULL,
    time_slot     VARCHAR(30) NOT NULL,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sh_customer FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_sh_lookup ON slot_holds (service_date, time_slot, expires_at);
CREATE INDEX idx_sh_customer ON slot_holds (customer_id);
