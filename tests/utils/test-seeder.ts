import type { KeystoneContext } from '@keystone-6/core/types';
import { TEST_USERS_PASSWORD, UserData, UserRole } from '../../src/domains/user/user-typings';

export const usersData: UserData[] = [
  {
    name: 'Rick Deckard',
    email: 'rick.deckard@example.com',
    role: UserRole.superuser,
  },
  { name: 'Bryant', email: 'bryant@example.com', role: UserRole.superuser },
  { name: 'Gaff', email: 'gaff@example.com', role: UserRole.admin },
  { name: 'Rachael', email: 'rachael@example.com', role: UserRole.admin },
  { name: 'Roy Batty', email: 'roy.batty@example.com', role: UserRole.user },
  { name: 'Pris', email: 'pris@example.com', role: UserRole.user },
  {
    name: 'Leon Kowalski',
    email: 'leon.kowalski@example.com',
    role: UserRole.user,
  },
  {
    name: 'J.F. Sebastian',
    email: 'jf.sebastian@example.com',
    role: UserRole.user,
  },
  { name: 'Eldon Tyrell', email: 'eldon.tyrell@example.com', role: UserRole.user },
  { name: 'Zhora', email: 'zhora@example.com', role: UserRole.user },
  {
    name: 'Hannibal Chew',
    email: 'hannibal.chew@example.com',
    role: UserRole.user,
  },
  { name: 'Holden', email: 'holden@example.com', role: UserRole.user },
];

export const seedDatabase = async (context: KeystoneContext) => {
  await seedUsers(context);
};

const seedUsers = async (context: KeystoneContext) => {
  const usersNotInDatabase: UserData[] = [];

  for (const user of usersData) {
    const persistedUsers = await context.query.User.findMany({
      where: { email: { equals: user.email } },
      query: 'name',
    });

    if (persistedUsers.length === 0) {
      user.password = TEST_USERS_PASSWORD;
      usersNotInDatabase.push(user);
    }
  }

  if (usersNotInDatabase.length > 0) {
    await context.sudo().query.User.createMany({
      data: usersNotInDatabase,
    });
  }
};
