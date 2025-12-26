import { createDb } from './index';
import { users } from './schema/users';
import { documents } from './schema/documents';

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
    const seededUsers = await db
      .insert(users)
      .values([
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
      ])
      .returning();

    // Seed documents
    console.log('📄 Seeding documents...');
    await db.insert(documents).values([
      {
        ownerId: seededUsers[0]!.id,
        title: 'Getting Started with React',
      },
      {
        ownerId: seededUsers[0]!.id,
        title: 'TypeScript Best Practices 2025',
      },
      {
        ownerId: seededUsers[1]!.id,
        title: 'Introduction to Hono Framework',
      },
      {
        ownerId: seededUsers[1]!.id,
        title: 'Building Real-time Collaboration Apps',
      },
      {
        ownerId: seededUsers[2]!.id,
        title: 'Database Migration Strategies',
      },
      {
        ownerId: seededUsers[2]!.id,
        title: 'Modern Web Development Trends',
      },
      {
        ownerId: seededUsers[0]!.id,
        title: 'Project Planning Template',
      },
      {
        ownerId: seededUsers[1]!.id,
        title: 'Team Meeting Notes - Q1 2025',
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
