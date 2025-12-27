import { eq, count } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../../core/errors';
import { users } from '@collab/db';
import type { DbClient } from '@collab/db';
import type { CreateUser, UpdateUser, ListUsersQuery } from './users.schemas';

export const getUserById = async (db: DbClient, id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  const user = result[0];
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
};

export const getAllUsers = async (db: DbClient, query: ListUsersQuery) => {
  const [usersList, totalResult] = await Promise.all([
    db.select().from(users).limit(query.limit).offset(query.offset),
    db.select({ count: count() }).from(users),
  ]);

  return {
    users: usersList,
    total: totalResult[0]?.count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
};

export const createUser = async (db: DbClient, data: CreateUser) => {
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

  if (existing[0]) {
    throw new ConflictError(`User with email '${data.email}' already exists`);
  }

  const result = await db.insert(users).values(data).returning();
  return result[0]!;
};

export const updateUser = async (db: DbClient, id: string, data: UpdateUser) => {
  const current = await db.select().from(users).where(eq(users.id, id)).limit(1);

  if (!current[0]) {
    throw new NotFoundError('User', id);
  }

  if (data.email) {
    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);

    if (existing[0] && existing[0].id !== id) {
      throw new ConflictError(`User with email '${data.email}' already exists`);
    }
  }

  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return result[0]!;
};

export const deleteUser = async (db: DbClient, id: string) => {
  const result = await db.delete(users).where(eq(users.id, id)).returning();

  const deletedUser = result[0];
  if (!deletedUser) {
    throw new NotFoundError('User', id);
  }
  return deletedUser;
};
