-- =============================================================================
-- Migration: V23__update_current_schedule_slot_capacity.sql
-- Description: Updates the slot capacity of the active CURRENT schedule
--              configuration to 2 vehicles per slot.
-- =============================================================================

UPDATE schedule_configurations
SET slot_capacity = 2,
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'CURRENT';

