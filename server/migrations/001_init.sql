-- migrations/001_init.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  refresh_token TEXT,
  last_seen TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(id, email)
);

CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES users(id) ON DELETE CASCADE,
  saved_name TEXT, -- custom name saved by owner for this contact
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(owner_id, contact_id)
);


-- CREATE TABLE pending_invites (
--   id BIGSERIAL PRIMARY KEY,
--   inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   invitee_email TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT now(),
--   UNIQUE(inviter_id, invitee_email)
-- );

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm','group')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_statuses (
  message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent','delivered','read')),
  updated_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

-- Indexes for common queries
-- CREATE INDEX IF NOT EXISTS idx_messages_conv_created_at ON messages(conversation_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_msg_status_user ON message_statuses(user_id);
