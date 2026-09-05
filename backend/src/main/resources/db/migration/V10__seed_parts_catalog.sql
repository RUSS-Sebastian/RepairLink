-- Seed representative parts for local development and admin UI testing.
INSERT INTO parts (
    part_id,
    name,
    brand,
    part_number,
    description,
    supplier_name,
    warranty_months,
    price,
    stock_quantity,
    reorder_level,
    status,
    created_by,
    updated_by
)
SELECT
    seed.part_id,
    seed.name,
    seed.brand,
    seed.part_number,
    seed.description,
    seed.supplier_name,
    seed.warranty_months,
    seed.price,
    seed.stock_quantity,
    seed.reorder_level,
    seed.status,
    admin.user_id,
    admin.user_id
FROM (
    VALUES
        (
            '30000000-0000-4000-8000-000000000001'::UUID,
            'Brake Pad Set (Front)',
            'Bosch',
            'BSH-BP-0915',
            'Front axle ceramic brake pad set for sedans.',
            'Bosch Direct',
            12::SMALLINT,
            64.90::NUMERIC(12,2),
            48,
            15,
            'ACTIVE'
        ),
        (
            '30000000-0000-4000-8000-000000000002'::UUID,
            'Brake Pad Set (Rear)',
            'Brembo',
            'BMM-BP-2280',
            'Rear performance brake pad set with wear sensor.',
            'Brembo Distribution',
            12::SMALLINT,
            79.50::NUMERIC(12,2),
            6,
            15,
            'ACTIVE'
        ),
        (
            '30000000-0000-4000-8000-000000000003'::UUID,
            'Oil Filter',
            'Mann-Filter',
            'MAN-OF-5180',
            'High-flow spin-on oil filter for gasoline engines.',
            'Mann Filter Supply',
            6::SMALLINT,
            12.90::NUMERIC(12,2),
            120,
            25,
            'ACTIVE'
        ),
        (
            '30000000-0000-4000-8000-000000000004'::UUID,
            'Car Battery (AGM 49Ah)',
            'DieHard',
            'DH-BT-AGM49',
            'Maintenance-free AGM starter battery, 49Ah.',
            'DieHard Batteries',
            24::SMALLINT,
            210.00::NUMERIC(12,2),
            0,
            5,
            'ACTIVE'
        ),
        (
            '30000000-0000-4000-8000-000000000005'::UUID,
            'Spark Plug Set',
            'NGK',
            'NGK-SP-9814',
            'Iridium spark plug set, pack of 4.',
            'NGK Direct',
            9::SMALLINT,
            8.50::NUMERIC(12,2),
            9,
            15,
            'ACTIVE'
        ),
        (
            '30000000-0000-4000-8000-000000000006'::UUID,
            'Cabin Air Filter',
            'Mann-Filter',
            'MAN-CF-1120',
            'Activated carbon cabin air filter.',
            'Mann Filter Supply',
            6::SMALLINT,
            9.90::NUMERIC(12,2),
            35,
            10,
            'INACTIVE'
        ),
        (
            '30000000-0000-4000-8000-000000000007'::UUID,
            'Timing Belt Kit',
            'Gates',
            'GAT-TB-7742',
            'Rubber timing belt kit with tensioner.',
            'Gates Supply',
            18::SMALLINT,
            45.90::NUMERIC(12,2),
            20,
            10,
            'ARCHIVED'
        )
) AS seed(
    part_id,
    name,
    brand,
    part_number,
    description,
    supplier_name,
    warranty_months,
    price,
    stock_quantity,
    reorder_level,
    status
)
JOIN users admin
    ON admin.email = 'russalejandro39@gmail.com'
ON CONFLICT (part_number) DO NOTHING;
