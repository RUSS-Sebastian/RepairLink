-- =============================================================================
-- Migration: V19__reset_to_completed_configurations.sql
-- Description: Removes current and upcoming seeded configurations from V18.
--              Generates 5 distinct past COMPLETED schedule configurations so
--              the admin can create their own CURRENT and UPCOMING schedules.
-- =============================================================================

-- 1. CLEAN UP PREVIOUS SEED CONFIGURATIONS
DELETE FROM schedule_configurations
WHERE configuration_id IN (
    '40000000-0000-4000-8000-000000000001'::UUID,
    '40000000-0000-4000-8000-000000000002'::UUID,
    '40000000-0000-4000-8000-000000000003'::UUID,
    '40000000-0000-4000-8000-000000000004'::UUID,
    '40000000-0000-4000-8000-000000000005'::UUID
);

-- 2. SEED 5 COMPLETED HISTORICAL SCHEDULE CONFIGURATIONS
-- All date windows are in the past (April 2026 through August 2026).
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
    'COMPLETED',
    admin.user_id,
    admin.user_id
FROM (
    VALUES
        (
            '40000000-0000-4000-8000-000000000011'::UUID,
            'Config 1',
            '2026-04-01'::DATE,
            '2026-04-30'::DATE,
            30,
            '08:00'::TIME,
            '17:00'::TIME,
            60,
            4,
            15,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[]
        ),
        (
            '40000000-0000-4000-8000-000000000012'::UUID,
            'Config 2',
            '2026-05-01'::DATE,
            '2026-05-31'::DATE,
            31,
            '08:00'::TIME,
            '17:00'::TIME,
            60,
            5,
            15,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[]
        ),
        (
            '40000000-0000-4000-8000-000000000013'::UUID,
            'Config 3',
            '2026-06-01'::DATE,
            '2026-06-30'::DATE,
            30,
            '08:00'::TIME,
            '18:00'::TIME,
            60,
            6,
            20,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']::VARCHAR(15)[]
        ),
        (
            '40000000-0000-4000-8000-000000000014'::UUID,
            'Config 4',
            '2026-07-01'::DATE,
            '2026-07-31'::DATE,
            31,
            '08:30'::TIME,
            '17:30'::TIME,
            45,
            5,
            15,
            48,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[]
        ),
        (
            '40000000-0000-4000-8000-000000000015'::UUID,
            'Config 5',
            '2026-08-01'::DATE,
            '2026-08-31'::DATE,
            31,
            '08:00'::TIME,
            '17:00'::TIME,
            60,
            5,
            15,
            24,
            ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::VARCHAR(15)[]
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
    operating_days
)
LEFT JOIN (
    SELECT user_id
    FROM users
    WHERE email = 'russalejandro39@gmail.com'
    LIMIT 1
) admin ON TRUE
ON CONFLICT (configuration_id) DO UPDATE
SET
    name = EXCLUDED.name,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = 'COMPLETED';


-- 3. SEED RECURRING BREAKS FOR HISTORICAL CONFIGURATIONS
INSERT INTO schedule_breaks (
    break_id,
    configuration_id,
    day_of_week,
    start_time,
    end_time,
    label
)
VALUES
    -- Config 1 (Apr 2026)
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000011'::UUID, 'MONDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000011'::UUID, 'WEDNESDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000011'::UUID, 'FRIDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),

    -- Config 2 (May 2026)
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000012'::UUID, 'TUESDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000012'::UUID, 'THURSDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),

    -- Config 3 (Jun 2026 - Mon to Sat)
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000013'::UUID, 'MONDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000013'::UUID, 'TUESDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000013'::UUID, 'WEDNESDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000013'::UUID, 'THURSDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000013'::UUID, 'FRIDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),

    -- Config 4 (Jul 2026)
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000014'::UUID, 'WEDNESDAY', '12:30'::TIME, '13:30'::TIME, 'Lunch Break'),

    -- Config 5 (Aug 2026)
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000015'::UUID, 'MONDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break'),
    (gen_random_uuid(), '40000000-0000-4000-8000-000000000015'::UUID, 'FRIDAY', '12:00'::TIME, '13:00'::TIME, 'Lunch Break')
ON CONFLICT DO NOTHING;


-- 4. SEED BLOCKED DATES (Historical Holidays & Maintenance)
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
            '41000000-0000-4000-8000-000000000011'::UUID,
            '40000000-0000-4000-8000-000000000011'::UUID,
            '2026-04-13'::DATE,
            'Water Festival Holiday'
        ),
        (
            '41000000-0000-4000-8000-000000000012'::UUID,
            '40000000-0000-4000-8000-000000000012'::UUID,
            '2026-05-01'::DATE,
            'Labor Day Holiday'
        ),
        (
            '41000000-0000-4000-8000-000000000013'::UUID,
            '40000000-0000-4000-8000-000000000013'::UUID,
            '2026-06-15'::DATE,
            'Hydraulic Lift Servicing'
        ),
        (
            '41000000-0000-4000-8000-000000000014'::UUID,
            '40000000-0000-4000-8000-000000000014'::UUID,
            '2026-07-19'::DATE,
            'Martyrs Day Holiday'
        ),
        (
            '41000000-0000-4000-8000-000000000015'::UUID,
            '40000000-0000-4000-8000-000000000015'::UUID,
            '2026-08-17'::DATE,
            'Workshop Renovation'
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

