ALTER TABLE users
ALTER COLUMN password_hash TYPE BYTEA USING password_hash::bytea;