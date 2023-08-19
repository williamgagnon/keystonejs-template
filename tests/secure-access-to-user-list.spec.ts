import type { BaseItem } from '@keystone-6/core/types';
import { expect } from 'chai';
import { UserData, UserRole } from '../src/domains/user/user-typings';
import {
  isAccessDeniedError,
  isAccessDeniedErrorForItemUpdate,
  isAccessDeniedErrorForOperationCreate,
  isAccessDeniedErrorForOperationDelete,
  isAccessDeniedErrorForOperationUpdate,
} from '../src/utils/access-utils';
import {
  givenLoggedIn,
  givenLoggedOut,
  givenRandomUserData,
  givenTestAdmin,
  givenTestSuperUser,
  givenTestUser,
} from './utils/given-pre-conditions';
import { setupKeystoneTests, TestConfig } from './utils/test-builder';

describe('Secure access to user list', function () {
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

  it('Refuse query user for unauthenticated users', async function () {
    givenLoggedOut(testConfig);
    await validateNoAccessToQueryDoesNotRaiseExceptionButInsteadReturnsEmptyArray(testConfig);
  });

  async function validateNoAccessToQueryDoesNotRaiseExceptionButInsteadReturnsEmptyArray(testConfig: TestConfig): Promise<void> {
    const users = await testConfig.args.context.query.User.findMany({
      query: 'id name',
    });
    expect(users).not.to.be.null;
    expect(users).to.have.length(0);
  }

  it('Allow query all users for superuser role', async function () {
    givenLoggedIn(testConfig, testSuperUser);
    await validateCanQueryUsers(testSuperUser, true, true);
  });

  it('Allow query myself only for admin role', async function () {
    givenLoggedIn(testConfig, testAdmin);
    await validateCanQueryUsers(testAdmin, true, false);
  });

  it('Allow query myself only for user role', async function () {
    givenLoggedIn(testConfig, testUser);
    await validateCanQueryUsers(testUser, true, false);
  });

  async function validateCanQueryUsers(me: BaseItem, canSeeMyself: boolean, canSeeOthers: boolean): Promise<void> {
    const users = await testConfig.args.context.query.User.findMany({
      query: 'id name',
    });
    expect(users).not.to.be.null;

    let foundMe = false;
    let foundOthers = false;

    for (const user of users) {
      if (user.id === me.id) {
        foundMe = true;
      } else {
        foundOthers = true;
      }
    }

    expect(foundMe).to.equal(canSeeMyself);
    expect(foundOthers).to.equal(canSeeOthers);
  }

  it('Refuse create user for unauthenticated users', async function () {
    givenLoggedOut(testConfig);
    const userData: UserData = givenRandomUserData();

    try {
      await testConfig.args.context.query.User.createOne({
        data: userData,
      });
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationCreate(error)).to.be.true;
    }
  });

  it('Allow create user for superuser role', async function () {
    try {
      await whenCreateUserByUser(testSuperUser);
    } catch (error) {
      expect.fail();
    }
  });

  it('Refuse create user for admin role', async function () {
    try {
      await whenCreateUserByUser(testAdmin);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationCreate(error)).to.be.true;
    }
  });

  it('Refuse create user for user role', async function () {
    try {
      await whenCreateUserByUser(testUser);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationCreate(error)).to.be.true;
    }
  });

  async function whenCreateUserByUser(user: BaseItem): Promise<BaseItem> {
    givenLoggedIn(testConfig, user);
    const userData = givenRandomUserData();

    const newUser: BaseItem = (await testConfig.args.context.query.User.createOne({
      data: userData,
    })) as BaseItem;

    return newUser;
  }

  it('Allow update other user for superuser role', async function () {
    const newUser: BaseItem = await whenCreateUserByUser(testSuperUser);
    await whenUpdateUserByUser(testSuperUser, newUser.id.toString(), givenRandomUserData());
  });

  it('Allow update myself for superuser role', async function () {
    validateUserCanUpdateOwnProfile(testSuperUser);
  });

  it('Refuse update other user for admin role', async function () {
    validateUserCannotUpdateOtherProfile(testAdmin);
  });

  it('Allow update myself for admin role', async function () {
    validateUserCanUpdateOwnProfile(testAdmin);
  });

  it('Refuse update other user for user role', async function () {
    validateUserCannotUpdateOtherProfile(testUser);
  });

  it('Allow update myself for user role', async function () {
    validateUserCanUpdateOwnProfile(testUser);
  });

  async function whenUpdateUserByUser(user: BaseItem, userId: string, userData: UserData): Promise<void> {
    givenLoggedIn(testConfig, user);

    await testConfig.args.context.query.User.updateOne({
      where: { id: userId },
      data: userData,
      query: 'id name',
    });
  }

  async function validateUserCanUpdateOwnProfile(user: BaseItem) {
    const updateData: UserData = {
      name: user.name as string,
      email: user.email as string,
      password: user.password as string,
      role: user.role as string,
    };

    await whenUpdateUserByUser(user, user.id.toString(), updateData);
  }

  async function validateUserCannotUpdateOtherProfile(user: BaseItem) {
    const newUser: BaseItem = await whenCreateUserByUser(testSuperUser);
    try {
      await whenUpdateUserByUser(user, newUser.id.toString(), givenRandomUserData());
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationUpdate(error)).to.be.true;
    }
  }

  it('Refuse admin role to change his own role', async function () {
    validateNonSuperUserCannotChangeTheirRole(testAdmin);
  });

  it('Refuse user role to change his own role', async function () {
    validateNonSuperUserCannotChangeTheirRole(testUser);
  });

  async function validateNonSuperUserCannotChangeTheirRole(user: BaseItem): Promise<void> {
    givenLoggedIn(testConfig, user);
    const updateData: UserData = {
      role: UserRole.superuser,
    };
    try {
      await whenUpdateUserByUser(user, user.id.toString(), updateData);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForItemUpdate(error)).to.be.true;
    }
  }

  it('Refuse delete user for superuser role', async function () {
    await validateDeleteAccessControlFor(testSuperUser);
  });

  it('Refuse delete user for admin role', async function () {
    await validateDeleteAccessControlFor(testAdmin);
  });

  it('Refuse delete user for user role', async function () {
    await validateDeleteAccessControlFor(testUser);
  });

  async function validateDeleteAccessControlFor(user: BaseItem): Promise<void> {
    try {
      await whenDeleteUserByUser(user, testSuperUser);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationDelete(error)).to.be.true;
    }
  }

  async function whenDeleteUserByUser(user: BaseItem, deleteTarget: BaseItem): Promise<void> {
    givenLoggedIn(testConfig, user);

    await testConfig.args.context.query.User.deleteOne({
      where: { id: deleteTarget.id.toString() },
    });
  }

  it('Additional tests for access-utils to get 100% coverage', async function () {
    expect(isAccessDeniedErrorForOperationCreate({})).to.be.false;
    expect(isAccessDeniedErrorForOperationUpdate({})).to.be.false;
    expect(isAccessDeniedErrorForOperationDelete({})).to.be.false;
    expect(isAccessDeniedErrorForItemUpdate({})).to.be.false;
  });
});
