import type { BaseItem } from '@keystone-6/core/types';
import { expect } from 'chai';
import { UserData, UserRole } from '../src/domains/user/user-typings';
import { isAccessDeniedError } from '../src/utils/access-utils';
import {
  givenLoggedIn,
  givenRandomUserData,
  givenTestAdmin,
  givenTestSuperUser,
  givenTestUser,
} from './utils/given-pre-conditions';
import { setupKeystoneTests, TestConfig } from './utils/test-builder';

describe('Create user with role superuser requires role superuser', function () {
  let testConfig: TestConfig;
  let testSuperUser: BaseItem;
  let testAdmin: BaseItem;
  let testUser: BaseItem;

  before(async function () {
    testConfig = await setupKeystoneTests();

    testSuperUser = await givenTestSuperUser(testConfig);
    testAdmin = await givenTestAdmin(testConfig);
    testUser = await givenTestUser(testConfig);
  });

  it('User with role superuser can create a superuser', async function () {
    givenLoggedIn(testConfig, testSuperUser);

    const userData: UserData = givenRandomUserData();
    userData.role = UserRole.superuser;

    const user = await testConfig.args.context.query.User.createOne({
      data: userData,
      query: 'id name role',
    });
    expect(user).not.to.be.null;
    expect(user.role).to.equal(UserRole.superuser);
  });

  it('User with role superuser can create an admin', async function () {
    givenLoggedIn(testConfig, testSuperUser);

    const userData: UserData = givenRandomUserData();
    userData.role = UserRole.admin;

    const user = await testConfig.args.context.query.User.createOne({
      data: userData,
      query: 'id name role',
    });
    expect(user).not.to.be.null;
    expect(user.role).to.equal(UserRole.admin);
  });

  it('User with role admin cannot create a superuser', async function () {
    givenLoggedIn(testConfig, testAdmin);

    const userData: UserData = givenRandomUserData();
    userData.role = UserRole.superuser;

    try {
      await testConfig.args.context.query.User.createOne({
        data: userData,
        query: 'id name role',
      });
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
    }
  });

  it('User with role user cannot create a superuser', async function () {
    givenLoggedIn(testConfig, testUser);

    const userData: UserData = givenRandomUserData();
    userData.role = UserRole.superuser;

    try {
      await testConfig.args.context.query.User.createOne({
        data: userData,
        query: 'id name role',
      });
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
    }
  });
});
