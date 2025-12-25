import { z } from 'zod';

// Base user schema - matches database structure
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a new user
export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

// Schema for updating a user
export const UpdateUserSchema = CreateUserSchema.partial();

// Schema for user ID parameter
export const UserIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

// Schema for listing users with pagination
export const ListUsersQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

// Response schemas
export const UserResponseSchema = UserSchema;

export const UsersListResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
