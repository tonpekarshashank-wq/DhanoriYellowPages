import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Create a Neon HTTP connection and wrap it with Drizzle.
 * This uses the HTTP driver (stateless, edge-compatible), not WebSocket,
 * which is the right choice for Vercel serverless/edge functions.
 */
function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill in your Neon connection string."
    );
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

/** Singleton for the server lifetime */
let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export type Db = ReturnType<typeof getDb>;
