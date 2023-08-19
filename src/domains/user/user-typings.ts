export enum UserRole {
  superuser = 'superuser',
  admin = 'admin',
  user = 'user',
}

export type UserData = {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
};

export const INITIAL_SUPER_USER_NAME = 'Test SuperUser';
export const INITIAL_SUPER_USER_EMAIL = 'superuser@example.com';
export const INITIAL_ADMIN_NAME = 'Test Admin';
export const INITIAL_ADMIN_EMAIL = 'admin@example.com';
export const INITIAL_USER_NAME = 'Test User';
export const INITIAL_USER_EMAIL = 'user@example.com';

export const TEST_USERS_PASSWORD = 'templatetest';

export const INITIAL_USERS = [
  {
    name: INITIAL_SUPER_USER_NAME,
    email: INITIAL_SUPER_USER_EMAIL,
    role: UserRole.superuser,
    password: TEST_USERS_PASSWORD,
  },
  {
    name: INITIAL_ADMIN_NAME,
    email: INITIAL_ADMIN_EMAIL,
    role: UserRole.admin,
    password: TEST_USERS_PASSWORD,
  },
  {
    name: INITIAL_USER_NAME,
    email: INITIAL_USER_EMAIL,
    role: UserRole.user,
    password: TEST_USERS_PASSWORD,
  },
];
