import { sql } from './database';
import * as path from 'path';
import * as fs from 'fs/promises';

async function runMigrations() {
  // Create migrations table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Get all migration files
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const migrationFiles = await fs.readdir(migrationsDir);

  for (const file of migrationFiles) {
    // Check if migration has been executed
    const [executed] = await sql`
      SELECT * FROM migrations WHERE name = ${file}
    `;

    if (!executed) {
      // Run migration
      const migration = require(path.join(migrationsDir, file));
      await migration.up();

      // Mark migration as executed
      await sql`
        INSERT INTO migrations (name) VALUES (${file})
      `;

      console.log(`Executed migration: ${file}`);
    }
  }

  console.log('All migrations executed successfully');
}

export default runMigrations;