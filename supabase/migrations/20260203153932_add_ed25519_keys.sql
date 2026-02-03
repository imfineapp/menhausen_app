-- Add Ed25519 signature keys for premium status
-- Migration: 20260203153932_add_ed25519_keys
-- Purpose: Store Ed25519 key pairs for signing premium status data

-- Add Ed25519 key fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ed25519_private_key TEXT; -- Base64-encoded PKCS8 private key (encrypted in production)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ed25519_public_key TEXT; -- Base64-encoded raw public key
ALTER TABLE users ADD COLUMN IF NOT EXISTS ed25519_key_version INTEGER DEFAULT 1; -- For key rotation

-- Add index on key version for rotation queries
CREATE INDEX IF NOT EXISTS idx_users_ed25519_key_version ON users(ed25519_key_version);

-- Add comment explaining the fields
COMMENT ON COLUMN users.ed25519_private_key IS 'Ed25519 private key in PKCS8 format (base64), used for signing premium status';
COMMENT ON COLUMN users.ed25519_public_key IS 'Ed25519 public key in raw format (base64), sent to client for signature verification';
COMMENT ON COLUMN users.ed25519_key_version IS 'Key version number for rotation support';
