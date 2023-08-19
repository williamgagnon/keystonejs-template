import type { KeystoneContext } from '@keystone-6/core/types';
import { INITIAL_USERS } from './user-typings';

export const initUsers = async (context: KeystoneContext) => {
  for (const userData of INITIAL_USERS) {
    const users = await context.sudo().query.User.findMany({
      where: { email: { equals: userData.email } },
      query: 'name',
    });

    if (users.length === 0) {
      await context.sudo().query.User.createOne({
        data: userData,
        query: 'name',
      });
    }
  }
};
