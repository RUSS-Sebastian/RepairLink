INSERT INTO additional_services (
    additional_service_id, name, description, price, applicability, status
)
VALUES
    ('a0000000-0000-4000-8000-000000000001', 'Engine Oil Change', 'Replace the engine oil with fresh oil suitable for the vehicle.', 120000, 'NORMAL_CAR', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000002', 'Engine Flush', 'Clean accumulated deposits from the engine lubrication system.', 85000, 'NORMAL_CAR', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000003', 'Engine Wash', 'Clean the engine bay using vehicle-safe cleaning methods.', 40000, 'NORMAL_CAR', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000004', 'Coolant Check', 'Inspect coolant level, condition, and visible cooling-system leaks.', 30000, 'NORMAL_CAR', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000005', 'Transmission Fluid Check', 'Inspect transmission-fluid level and condition.', 45000, 'NORMAL_CAR', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000006', 'Timing Belt Inspection', 'Inspect timing-belt condition and signs of wear.', 35000, 'NORMAL_CAR', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000007', 'Fuel System Cleaning', 'Clean key fuel-system components to support efficient operation.', 60000, 'NORMAL_CAR', 'ACTIVE'),

    ('a0000000-0000-4000-8000-000000000008', 'Charging Port Cleaning', 'Clean the EV charging port and inspect it for visible damage.', 25000, 'EV', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000009', 'Charging Cable Inspection', 'Inspect the charging cable, connector, and insulation for wear.', 30000, 'EV', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000010', 'Software Update', 'Check for and install supported vehicle software updates.', 50000, 'EV', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000011', 'Battery Cooling System Check', 'Inspect the EV battery cooling system and related components.', 45000, 'EV', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000012', 'High-Voltage System Inspection', 'Perform a safety-focused inspection of the EV high-voltage system.', 80000, 'EV', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000013', 'Battery Diagnostics', 'Run diagnostic checks on EV battery condition and reported faults.', 60000, 'EV', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000014', 'EV System Diagnostics', 'Scan major EV control systems for diagnostic trouble codes.', 75000, 'EV', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000015', 'Charging System Inspection', 'Inspect the vehicle charging system and verify normal operation.', 55000, 'EV', 'ACTIVE'),

    ('a0000000-0000-4000-8000-000000000016', 'Car Wash', 'Clean the vehicle exterior using a standard hand-wash process.', 30000, 'BOTH', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000017', 'Interior Cleaning', 'Vacuum and clean common interior surfaces.', 50000, 'BOTH', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000018', 'Exterior Polishing/Waxing', 'Polish and wax exterior painted surfaces for added protection.', 90000, 'BOTH', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000019', 'Tire Rotation', 'Rotate tires to support more even tread wear.', 25000, 'BOTH', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000020', 'Wheel Alignment', 'Measure and adjust wheel alignment to supported specifications.', 35000, 'BOTH', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000021', 'Wheel Balancing', 'Balance wheel and tire assemblies to reduce vibration.', 30000, 'BOTH', 'ACTIVE'),
    ('a0000000-0000-4000-8000-000000000022', 'Tire Pressure Check', 'Check and adjust tire pressure to the recommended level.', 10000, 'BOTH', 'ACTIVE');
