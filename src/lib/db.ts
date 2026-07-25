import { createClient, type Client } from "@libsql/client";

// The 51 scored blocks ship in src/data/seed.ts. A libSQL store is optional and
// is consulted only when TURSO_DATABASE_URL is configured; every reader in
// blocks.ts falls back to the bundled seed when it is absent or unreachable.
//
// The client is resolved lazily and never at module scope. createClient throws
// synchronously when it cannot open a local SQLite file, and on a read-only
// serverless filesystem that took down /compare and /api/blocks with a 500
// before any caller's fallback could run. Resolution happens once per process
// and a failure is remembered as "no store" rather than retried per request.
let resolved: Client | null | undefined;

export function getDb(): Client | null {
  if (resolved !== undefined) return resolved;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    resolved = null;
    return resolved;
  }

  try {
    resolved = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  } catch {
    resolved = null;
  }
  return resolved;
}

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
  const db = getDb();
  if (!db) {
    throw new Error(
      "No libSQL store configured. Set TURSO_DATABASE_URL before initializing the schema."
    );
  }

  const statements = SCHEMA.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.execute(statement + ";");
  }
}
