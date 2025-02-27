ALTER TABLE users
ADD COLUMN rating NUMERIC(3,2) DEFAULT 3.5 CHECK (rating >= 0 AND rating <= 5.0);

CREATE INDEX IF NOT EXISTS users_name_idx ON users USING GIN (to_tsvector('simple', name));