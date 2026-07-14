-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to scans table (384 dimensions for all-MiniLM-L6-v2 model)
ALTER TABLE scans ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Index for fast similarity search
CREATE INDEX IF NOT EXISTS scans_embedding_idx ON scans USING ivfflat (embedding vector_cosine_ops);
