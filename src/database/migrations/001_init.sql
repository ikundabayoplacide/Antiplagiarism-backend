-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  plagiarism_percent NUMERIC(5,2) NOT NULL,
  original_percent NUMERIC(5,2) NOT NULL,
  word_count INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('original', 'flagged')),
  matched_sections JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  email_notifications BOOLEAN DEFAULT true,
  plagiarism_alerts BOOLEAN DEFAULT true,
  similarity_threshold INTEGER DEFAULT 30
);
