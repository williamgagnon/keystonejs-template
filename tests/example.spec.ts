import type { BaseItem } from '@keystone-6/core/types';
import { expect } from 'chai';
import { givenLoggedIn, givenTestSuperUser } from './utils/given-pre-conditions';
import { setupKeystoneTests, TestConfig } from './utils/test-builder';
import { usersData } from './utils/test-seeder';

describe('Keystone tests example', function () {
  let testConfig: TestConfig;
  let testSuperUser: BaseItem;

  before(async function () {
    testConfig = await setupKeystoneTests();
    testSuperUser = await givenTestSuperUser(testConfig);
  });

  it('Find specific user by email', async function () {
    givenSuperUserRoleCanQueryAllUsers(testConfig, testSuperUser);

    const users = await testConfig.args.context.query.User.findMany({
      where: { email: { equals: usersData[0].email } },
      query: 'name role',
    });
    expect(users).not.to.be.null;
    expect(users).to.have.length(1);
    expect(users[0].name).to.equal(usersData[0].name);
    expect(users[0].role).to.equal(usersData[0].role);
  });
});

function givenSuperUserRoleCanQueryAllUsers(testConfig: TestConfig, testSuperUser: BaseItem) {
  givenLoggedIn(testConfig, testSuperUser);
}
