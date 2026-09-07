INSERT INTO loyalty_ranks (
    loyalty_rank_id,
    rank_name,
    minimum_points,
    maximum_points,
    discount_percentage,
    is_active,
    is_protected
)
VALUES
    ('b0000000-0000-4000-8000-000000000001', 'Bronze', 0, 999, 0, TRUE, TRUE),
    ('b0000000-0000-4000-8000-000000000002', 'Silver', 1000, 2999, 5, TRUE, FALSE),
    ('b0000000-0000-4000-8000-000000000003', 'Gold', 3000, 5999, 10, TRUE, FALSE),
    ('b0000000-0000-4000-8000-000000000004', 'Emerald', 6000, 8999, 12, TRUE, FALSE),
    ('b0000000-0000-4000-8000-000000000005', 'Platinum', 9000, 14999, 15, TRUE, FALSE),
    ('b0000000-0000-4000-8000-000000000006', 'Ruby', 15000, 24999, 18, TRUE, FALSE),
    ('b0000000-0000-4000-8000-000000000007', 'Diamond', 25000, 999999, 20, TRUE, FALSE);
