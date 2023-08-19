import type { BaseItem } from '@keystone-6/core/types';
import { expect } from 'chai';
import { initUsers } from '../src/domains/user/user-initializer';
import { INITIAL_SUPER_USER_EMAIL, INITIAL_SUPER_USER_NAME, UserRole } from '../src/domains/user/user-typings';
import { givenLoggedIn, givenTestSuperUser } from './utils/given-pre-conditions';
import { setupKeystoneTests, TestConfig } from './utils/test-builder';

describe('Seed super admin user', function () {
  let testConfig: TestConfig;
  let testSuperUser: BaseItem;

  before(async function () {
    testConfig = await setupKeystoneTests();
    testSuperUser = await givenTestSuperUser(testConfig);
  });

  it('Find super user by email', async function () {
    givenLoggedIn(testConfig, testSuperUser);

    const users = await testConfig.args.context.query.User.findMany({
      where: { email: { equals: INITIAL_SUPER_USER_EMAIL } },
      query: 'name role',
    });
    expect(users).not.to.be.null;
    expect(users).to.have.length(1);
    const adminUser = users[0];
    expect(adminUser.name).to.equal(INITIAL_SUPER_USER_NAME);
    expect(adminUser.role).to.equal(UserRole.superuser);
  });

  it('Only one super admin user should be seeded when initAdminUser is called two times', async function () {
    initUsers(testConfig.args.context);
    givenLoggedIn(testConfig, testSuperUser);

    const users = await testConfig.args.context.query.User.findMany({
      where: { email: { equals: INITIAL_SUPER_USER_EMAIL } },
      query: 'name role',
    });
    expect(users).not.to.be.null;
    expect(users).to.have.length(1);
  });
});
