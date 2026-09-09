-- V29: Clean up any rejection notifications incorrectly assigned to staff
DELETE FROM notifications
WHERE recipient_role = 'STAFF' AND type = 'SERVICE_REQUEST_REJECTED';
