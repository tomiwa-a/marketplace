CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id bigserial NOT NULL PRIMARY KEY,
  public_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  address text,
  phone_number text,
  activated boolean NOT NULL,
  verified boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  version integer NOT NULL DEFAULT 1
);

