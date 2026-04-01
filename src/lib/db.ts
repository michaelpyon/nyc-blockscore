import { createClient } from "@libsql/client";

// Turso client singleton
// Falls back to local SQLite file for development
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;

// Schema creation for initial setup
export const SCHEMA = `
-- Blocks: street segments between two cross streets
CREATE TABLE IF NOT EXISTS blocks (
  id TEXT PRIMARY KEY,
  street_name TEXT NOT NULL,
  from_cross TEXT NOT NULL,
  to_cross TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  borough TEXT NOT NULL,
  centroid_lat REAL NOT NULL,
  centroid_lng REAL NOT NULL,
  geometry_json TEXT NOT NULL,
  block_score REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Block scores: per-dimension scores, one row per dimension per week
CREATE TABLE IF NOT EXISTS block_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id TEXT NOT NULL REFERENCES blocks(id),
  dimension TEXT NOT NULL CHECK(dimension IN ('noise', 'transit', 'food', 'walk', 'construction')),
  score REAL NOT NULL,
  component_data_json TEXT NOT NULL DEFAULT '{}',
  week_of TEXT NOT NULL,
  UNIQUE(block_id, dimension, week_of)
);

-- Signals: individual data points from each source
CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id TEXT NOT NULL REFERENCES blocks(id),
  source TEXT NOT NULL CHECK(source IN ('311', 'dob', 'dohmh', 'walkscore', 'citibike')),
  signal_type TEXT NOT NULL,
  value REAL,
  raw_data_json TEXT NOT NULL DEFAULT '{}',
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(block_id, source, signal_type, date)
);

-- Pipeline runs: track each data refresh
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('running', 'success', 'error')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_block_scores_block_id ON block_scores(block_id);
CREATE INDEX IF NOT EXISTS idx_block_scores_dimension ON block_scores(dimension);
CREATE INDEX IF NOT EXISTS idx_signals_block_id ON signals(block_id);
CREATE INDEX IF NOT EXISTS idx_signals_source ON signals(source);
CREATE INDEX IF NOT EXISTS idx_blocks_neighborhood ON blocks(neighborhood);
CREATE INDEX IF NOT EXISTS idx_blocks_borough ON blocks(borough);
`;

export async function initializeDatabase(): Promise<void> {
  const statements = SCHEMA.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.execute(statement + ";");
  }
}
