import { config } from '@keystone-6/core';
import { lists } from './schema';
import { withAuth, session } from './src/config/auth-config';
import { databaseConfig } from './src/config/database-config';

export default withAuth(
  config({
    db: databaseConfig,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    lists,
    session,
  }),
);
