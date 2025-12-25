import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Container } from '../../core/container';
import * as usersService from './users.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserIdParamSchema,
  ListUsersQuerySchema,
} from './users.schemas';

export const createUsersRoutes = (container: Container) => {
  const { db } = container;

  return new Hono()
    .get('/', zValidator('query', ListUsersQuerySchema), async (c) => {
      const query = c.req.valid('query');
      const result = await usersService.getAllUsers(db, query);
      return c.json(result);
    })

    .get('/:id', zValidator('param', UserIdParamSchema), async (c) => {
      const { id } = c.req.valid('param');
      const user = await usersService.getUserById(db, id);
      return c.json(user);
    })

    .post('/', zValidator('json', CreateUserSchema), async (c) => {
      const data = c.req.valid('json');
      const user = await usersService.createUser(db, data);
      return c.json(user, 201);
    })

    .patch(
      '/:id',
      zValidator('param', UserIdParamSchema),
      zValidator('json', UpdateUserSchema),
      async (c) => {
        const { id } = c.req.valid('param');
        const data = c.req.valid('json');
        const user = await usersService.updateUser(db, id, data);
        return c.json(user);
      },
    )

    .delete('/:id', zValidator('param', UserIdParamSchema), async (c) => {
      const { id } = c.req.valid('param');
      const user = await usersService.deleteUser(db, id);
      return c.json(user);
    });
};

export type UsersRoutes = ReturnType<typeof createUsersRoutes>;
