DELETE FROM users a
USING users b
WHERE a.user_id > b.user_id
  AND a.phone = b.phone;

ALTER TABLE users
    ADD CONSTRAINT uq_users_phone UNIQUE (phone);
