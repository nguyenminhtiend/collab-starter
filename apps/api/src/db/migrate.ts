import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createDb } from './index';

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Count migration files
  const migrationsFolder = join(process.cwd(), 'drizzle');
  const migrationFiles = readdirSync(migrationsFolder).filter((f) => f.endsWith('.sql'));

  console.log('🔄 Running migrations...');
  console.log(`📁 Found ${migrationFiles.length} migration file(s) in ./drizzle`);

  if (migrationFiles.length > 0) {
    console.log('📋 Migration files:');
    migrationFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
  }

  // Create db instance using the shared setup
  const db = createDb(connectionString, { max: 1 });

  try {
    console.log('⚡ Executing migrations...');
    // Run migrations
    await migrate(db, {
      migrationsFolder: './drizzle',
      migrationsTable: 'schema_migrations',
      migrationsSchema: 'public',
    });
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

runMigrations()
  .then(() => {
    console.log('Migration process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
