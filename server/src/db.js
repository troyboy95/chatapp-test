import { Pool } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
dotenv.config();

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.connect().then(() => {
  console.log("Connected to Postgres");
}).catch(err => {
  console.error("Postgres connection error", err);
});


export async function runMigrations() {
  const migrations = readFileSync(
    new URL('../migrations/001_init.sql', import.meta.url)
  ).toString();

  try {
    // console.log("Running migrations...");
    await pool.query(migrations);
    console.log("Migrations applied");
  } catch (error) {
    console.error("Migration error", error);
    throw error;
  }
}
