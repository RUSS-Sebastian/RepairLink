-- V27: Create notifications table for staff and customer notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY,
    recipient_role VARCHAR(50) NOT NULL,
    recipient_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id UUID,
    reference_code VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_role ON notifications(recipient_role);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_user ON notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
