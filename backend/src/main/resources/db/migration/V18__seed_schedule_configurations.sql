-- =============================================================================
-- Migration: V18__seed_schedule_configurations.sql
-- Description: Seeds initial representative schedule configurations, recurring
--              breaks, and blocked exception dates for RepairLink.
-- =============================================================================

-- 1. SEED SCHEDULE CONFIGURATIONS
INSERT INTO schedule_configurations (
    configuration_id,
    name,
    start_date,
    end_date,
    booking_window_days,
    opening_time,
    closing_time,
    slot_duration_minutes,
    slot_capacity,
    hold_duration_minutes,
    cancellation_notice_hours,
    operating_days,
    status,
    created_by,
    updated_by
)
SELECT
    seed.configuration_id,
    seed.name,
    seed.start_date,
    seed.end_date,
    seed.booking_window_days,
    seed.opening_time,
    seed.closing_time,
    seed.slot_duration_minutes,
    seed.slot_capacity,
    seed.hold_duration_minutes,
    seed.cancellation_notice_hours,
    seed.operating_days,
    seed.status,
    admin.user_id,
    admin.user_id
FROM (
    VALUES
        (
            '40000000-0000-4000-8000-000000000001'::UUID,
            'Config 1',
            '2026-08-01'::DATE,
            '2026-08-31'::DATE,
            30,
            '08:00'::TIME,
            '17:00'::TIME,
            60,
            4,
            15,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[],
            'COMPLETED'
        ),
        (
            '40000000-0000-4000-8000-000000000002'::UUID,
            'Config 2',
            '2026-09-01'::DATE,
            '2026-09-30'::DATE,
            30,
            '08:00'::TIME,
            '18:00'::TIME,
            60,
            6,
            20,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']::VARCHAR(15)[],
            'CURRENT'
        ),
        (
            '40000000-0000-4000-8000-000000000003'::UUID,
            'Config 3',
            '2026-10-01'::DATE,
            '2026-10-31'::DATE,
            31,
            '09:00'::TIME,
            '17:00'::TIME,
            45,
            5,
            15,
            48,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[],
            'UPCOMING'
        ),
        (
            '40000000-0000-4000-8000-000000000004'::UUID,
            'Config 4',
            '2026-11-01'::DATE,
            '2026-11-30'::DATE,
            30,
            '08:30'::TIME,
            '17:30'::TIME,
            60,
            5,
            15,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[],
            'UPCOMING'
        ),
        (
            '40000000-0000-4000-8000-000000000005'::UUID,
            'Config 5',
            '2026-12-01'::DATE,
            '2026-12-31'::DATE,
            31,
            '08:00'::TIME,
            '16:00'::TIME,
            60,
            4,
            15,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[],
            'UPCOMING'
        )
) AS seed (
    configuration_id,
    name,
    start_date,
    end_date,
    booking_window_days,
    opening_time,
    closing_time,
    slot_duration_minutes,
    slot_capacity,
    hold_duration_minutes,
    cancellation_notice_hours,
    operating_days,
    status
)
LEFT JOIN (
    SELECT user_id
    FROM users
    WHERE email = 'russalejandro39@gmail.com'
    LIMIT 1
) admin ON TRUE
ON CONFLICT (configuration_id) DO NOTHING;


-- 2. SEED SCHEDULE BREAKS
INSERT INTO schedule_breaks (
    break_id,
    configuration_id,
    day_of_week,
    start_time,
    end_time,
    label
)
VALUES
    -- Config 1 breaks
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000001'::UUID, 'MONDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),

    -- Config 2 breaks (Mon - Fri)
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000002'::UUID, 'MONDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000002'::UUID, 'TUESDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000002'::UUID, 'WEDNESDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000002'::UUID, 'THURSDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000002'::UUID, 'FRIDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),

    -- Config 3 breaks
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000003'::UUID, 'WEDNESDAY', '12:30'::TIME, '13:30'::TIME, 'Lunch Break'),

    -- Config 4 breaks
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000004'::UUID, 'FRIDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break')
ON CONFLICT DO NOTHING;


-- 3. SEED SCHEDULE BLOCKED DATES
INSERT INTO schedule_blocked_dates (
    blocked_date_id,
    configuration_id,
    blocked_date,
    reason,
    created_by
)
SELECT
    seed.blocked_date_id,
    seed.configuration_id,
    seed.blocked_date,
    seed.reason,
    admin.user_id
FROM (
    VALUES
        (
            '41000000-0000-4000-8000-000000000001'::UUID,
            '40000000-0000-4000-8000-000000000001'::UUID,
            '2026-08-17'::DATE,
            'Public holiday'
        ),
        (
            '41000000-0000-4000-8000-000000000002'::UUID,
            '40000000-0000-4000-8000-000000000002'::UUID,
            '2026-09-14'::DATE,
            'Team training'
        ),
        (
            '41000000-0000-4000-8000-000000000003'::UUID,
            '40000000-0000-4000-8000-000000000003'::UUID,
            '2026-10-12'::DATE,
            'Workshop maintenance'
        )
) AS seed (
    blocked_date_id,
    configuration_id,
    blocked_date,
    reason
)
LEFT JOIN (
    SELECT user_id
    FROM users
    WHERE email = 'russalejandro39@gmail.com'
    LIMIT 1
) admin ON TRUE
ON CONFLICT (configuration_id, blocked_date) DO NOTHING;

