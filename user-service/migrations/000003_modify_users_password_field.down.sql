ALTER TABLE users
ALTER COLUMN password_hash TYPE TEXT USING password_hash::text;