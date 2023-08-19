import type { KeystoneContext } from '@keystone-6/core/types';
import { initUsers } from '../domains/user/user-initializer';

export const initDatabase = async (context: KeystoneContext) => {
  await initUsers(context);
};
