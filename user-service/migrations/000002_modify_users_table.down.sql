ALTER TABLE users
DROP COLUMN rating;

DROP INDEX IF EXISTS users_name_idx;
