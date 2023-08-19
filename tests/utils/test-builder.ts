import { setupTestEnv } from '@keystone-6/core/testing';
import type { TestEnv, TestArgs } from '@keystone-6/core/testing';
import config from '../../keystone';
import { seedDatabase } from './test-seeder';

const replaceVerboseJestConsoleToGetCleanerOutput = () => {
  global.console = require('console');
};

export const setupSimpleTests = async () => {
  replaceVerboseJestConsoleToGetCleanerOutput();
};

export type TestConfig = {
  env: TestEnv;
  args: TestArgs;
};

const buildKeystoneIntegrationTestEnvironment = async () => {
  const env: TestEnv = await setupTestEnv({ config });
  await env.connect();
  const args: TestArgs = env.testArgs;

  return { env, args };
};

let testConfig: TestConfig | null;

export const setupKeystoneTests = async function (): Promise<TestConfig> {
  if (!testConfig) {
    await setupSimpleTests();
    testConfig = await buildKeystoneIntegrationTestEnvironment();
    await seedDatabase(testConfig.args.context);
    console.log('😀 Keystone fixture is up.');
  }
  ensureNoSessionFromACachedTestConfig(testConfig);

  return testConfig;
};

export const teardownKeystoneTests = async (): Promise<void> => {
  if (testConfig) {
    await testConfig.env.disconnect();
    testConfig = null;
    console.log('👋 Keystone fixture is down.');
  }
};

export async function mochaGlobalSetup() {
  testConfig = null;
}

export async function mochaGlobalTeardown() {
  await teardownKeystoneTests();
}
function ensureNoSessionFromACachedTestConfig(testConfig: TestConfig) {
  delete testConfig.args.context.session;
}
