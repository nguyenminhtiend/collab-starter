import { createDb } from './index';
import { users } from './schema/users';

const seed = async () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('🌱 Starting database seeding...');

  const db = createDb(connectionString);

  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users);

    if (existingUsers.length > 0) {
      console.log('⚠️  Database already has data. Skipping seed...');
      return;
    }

    // Seed users
    console.log('📝 Seeding users...');
    await db.insert(users).values([
      {
        name: 'John Doe',
        email: 'john@example.com',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
      },
    ]);

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

seed()
  .then(() => {
    console.log('Seed process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  });
