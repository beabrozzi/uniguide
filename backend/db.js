/* Database connection + schema.
   In production this connects to Supabase PostgreSQL (DATABASE_URL, set on Render).
   For local testing without Postgres, set USE_PG_MEM=1 to use an in-memory database. */
const fs = require("fs");
const path = require("path");

let pool;
if (process.env.USE_PG_MEM) {
  const { newDb } = require("pg-mem");
  const mem = newDb();
  const { Pool } = mem.adapters.createPg();
  pool = new Pool();
} else {
  const { Pool } = require("pg");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase requires an encrypted (SSL) connection: PGSSL=true is set in render.yaml
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });
}

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  // Run statement by statement (keeps it compatible with the in-memory test database)
  for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
    await pool.query(stmt);
  }
}

module.exports = { pool, migrate, query: (text, params) => pool.query(text, params) };
