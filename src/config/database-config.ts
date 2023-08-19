import type { BaseKeystoneTypeInfo, DatabaseConfig } from '@keystone-6/core/types';
import { initDatabase } from './database-initializer';

const resolveDatabaseUrl = (): string => {
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.POSTGRES_PORT ?? 5432;
  const database = 'william';
  const user = 'william';
  const password = process.env.POSTGRES_PASSWORD ?? 'postgres';

  const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;

  return url;
};

export const databaseConfig: DatabaseConfig<BaseKeystoneTypeInfo> = {
  provider: 'postgresql',
  url: resolveDatabaseUrl(),
  useMigrations: true,
  idField: { kind: 'uuid' },
  onConnect: initDatabase,
};
