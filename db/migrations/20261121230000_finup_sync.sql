-- migrate:up

-- Full FinUp dataset per user (same shape as app backup JSON tables).
-- revision bumps on every accepted push; clients use LWW by (revision, updated_at).
CREATE TABLE user_finup_data (
  user_id uuid NOT NULL CONSTRAINT pk_user_finup_data PRIMARY KEY
    REFERENCES users(id) ON DELETE CASCADE,
  revision bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  client_id text,
  tables jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_user_finup_data_updated ON user_finup_data (updated_at DESC);

-- migrate:down

DROP TABLE IF EXISTS user_finup_data;
