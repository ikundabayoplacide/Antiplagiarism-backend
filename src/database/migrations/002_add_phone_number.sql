-- Add phone_number to users if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
