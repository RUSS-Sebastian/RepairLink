-- =============================================================================
-- Migration: V17__create_schedule_configurations.sql
-- Description: Creates the schedule configurations, recurring breaks, and
--              calendar exception (blocked dates) tables for RepairLink.
-- =============================================================================

-- 1. SCHEDULE CONFIGURATIONS (Master Schedule Windows & Policy)
CREATE TABLE schedule_configurations (
    configuration_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    booking_window_days INTEGER NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    slot_duration_minutes INTEGER NOT NULL,
    slot_capacity INTEGER NOT NULL,
    hold_duration_minutes INTEGER NOT NULL,
    cancellation_notice_hours INTEGER NOT NULL,
    operating_days VARCHAR(15)[] NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_schedule_config_dates
        CHECK (end_date >= start_date),

    CONSTRAINT chk_schedule_config_hours
        CHECK (closing_time > opening_time),

    CONSTRAINT chk_schedule_config_slot_duration
        CHECK (slot_duration_minutes >= 15),

    CONSTRAINT chk_schedule_config_slot_capacity
        CHECK (slot_capacity >= 1),

    CONSTRAINT chk_schedule_config_hold_duration
        CHECK (hold_duration_minutes >= 1),

    CONSTRAINT chk_schedule_config_cancellation_notice
        CHECK (cancellation_notice_hours >= 0),

    CONSTRAINT chk_schedule_config_booking_window
        CHECK (booking_window_days >= 1),

    CONSTRAINT chk_schedule_config_status
        CHECK (status IN ('UPCOMING', 'CURRENT', 'COMPLETED')),

    CONSTRAINT chk_schedule_config_operating_days_not_empty
        CHECK (cardinality(operating_days) > 0),

    CONSTRAINT fk_schedule_configurations_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_schedule_configurations_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(user_id)
        ON DELETE SET NULL,

    -- Guarantee active and upcoming configuration windows do not overlap
    CONSTRAINT uq_schedule_configurations_no_overlap
        EXCLUDE USING gist (
            daterange(start_date, end_date, '[]') WITH &&
        ) WHERE (status IN ('CURRENT', 'UPCOMING'))
);

CREATE INDEX idx_schedule_configurations_dates
    ON schedule_configurations (start_date, end_date);

CREATE INDEX idx_schedule_configurations_status
    ON schedule_configurations (status);


-- 2. SCHEDULE BREAKS (Recurring breaks per operating weekday)
CREATE TABLE schedule_breaks (
    break_id UUID PRIMARY KEY,
    configuration_id UUID NOT NULL,
    day_of_week VARCHAR(15) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    label VARCHAR(100) NOT NULL DEFAULT 'Break',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_schedule_breaks_configuration
        FOREIGN KEY (configuration_id) REFERENCES schedule_configurations(configuration_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_schedule_breaks_times
        CHECK (end_time > start_time),

    CONSTRAINT chk_schedule_breaks_day
        CHECK (day_of_week IN (
            'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
        )),

    CONSTRAINT uq_schedule_breaks_day_start
        UNIQUE (configuration_id, day_of_week, start_time)
);

CREATE INDEX idx_schedule_breaks_config_day
    ON schedule_breaks (configuration_id, day_of_week);


-- 3. SCHEDULE BLOCKED DATES (Calendar exceptions / maintenance / holidays)
CREATE TABLE schedule_blocked_dates (
    blocked_date_id UUID PRIMARY KEY,
    configuration_id UUID NOT NULL,
    blocked_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_schedule_blocked_dates_configuration
        FOREIGN KEY (configuration_id) REFERENCES schedule_configurations(configuration_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_schedule_blocked_dates_created_by
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT uq_schedule_blocked_date_per_config
        UNIQUE (configuration_id, blocked_date),

    CONSTRAINT chk_schedule_blocked_dates_reason_not_blank
        CHECK (TRIM(reason) <> '')
);

CREATE INDEX idx_schedule_blocked_dates_lookup
    ON schedule_blocked_dates (configuration_id, blocked_date);

