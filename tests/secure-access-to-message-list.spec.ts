import type { BaseItem } from '@keystone-6/core/types';
import { expect } from 'chai';
import { MessageData } from '../src/domains/message/message-typings';
import {
  isAccessDeniedError,
  isAccessDeniedErrorForOperationCreate,
  isAccessDeniedErrorForOperationDelete,
  isAccessDeniedErrorForOperationUpdate,
} from '../src/utils/access-utils';
import { connectToValue } from '../src/utils/query-utils';
import {
  givenLoggedIn,
  givenLoggedOut,
  givenPersistedRandomMessage,
  givenRandomMessageData,
  givenTestAdmin,
  givenTestSuperUser,
  givenTestUser,
} from './utils/given-pre-conditions';
import { setupKeystoneTests, TestConfig } from './utils/test-builder';

describe('Secure access to message list', function () {
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

  it('Refuse query message for unauthenticated users', async function () {
    givenLoggedOut(testConfig);
    givenPersistedRandomMessage(testConfig, testSuperUser, testSuperUser);

    await validateNoAccessToQueryDoesNotRaiseExceptionButInsteadReturnsEmptyArray(testConfig, testSuperUser);
  });

  async function validateNoAccessToQueryDoesNotRaiseExceptionButInsteadReturnsEmptyArray(
    testConfig: TestConfig,
    user: BaseItem,
  ): Promise<void> {
    const messages = await testConfig.args.context.query.Message.findMany({
      where: { from: { id: { equals: user.id.toString() } } },
      query: 'id title',
    });
    expect(messages).not.to.be.null;
    expect(messages).to.have.length(0);
  }

  it('Refuse create message for unauthenticated users', async function () {
    givenLoggedOut(testConfig);
    const messageData = givenRandomMessageData();
    try {
      await testConfig.args.context.query.Message.createOne({
        data: messageData,
      });
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
    }
  });

  it('Allow create message for superuser role', async function () {
    try {
      await whenCreateMessageByUser(testSuperUser);
    } catch (error) {
      expect.fail();
    }
  });

  it('Refuse create message for admin role', async function () {
    try {
      await whenCreateMessageByUser(testAdmin);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationCreate(error)).to.be.true;
    }
  });

  it('Refuse create message for user role', async function () {
    try {
      await whenCreateMessageByUser(testUser);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationCreate(error)).to.be.true;
    }
  });

  async function whenCreateMessageByUser(user: BaseItem): Promise<void> {
    givenLoggedIn(testConfig, user);
    const messageData = givenRandomMessageData();
    messageData.from = connectToValue(user);
    messageData.to = connectToValue(user);

    await testConfig.args.context.query.Message.createOne({
      data: messageData,
    });
  }

  it('Refuse update message for superuser role', async function () {
    await validateUpdateAccessControlFor(testSuperUser);
  });

  it('Refuse update message for admin role', async function () {
    await validateUpdateAccessControlFor(testAdmin);
  });

  it('Refuse update message for user role', async function () {
    await validateUpdateAccessControlFor(testUser);
  });

  async function validateUpdateAccessControlFor(user: BaseItem): Promise<void> {
    const message: BaseItem = await givenPersistedRandomMessage(testConfig, user, user);

    try {
      await whenUpdateMessageByUser(message, user);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationUpdate(error)).to.be.true;
    }
  }

  async function whenUpdateMessageByUser(message: BaseItem, user: BaseItem): Promise<void> {
    givenLoggedIn(testConfig, user);
    const messageData: MessageData = {
      title: (message.title as string) + ' updated',
    };

    await testConfig.args.context.query.Message.updateOne({
      where: { id: message.id.toString() },
      data: messageData,
      query: 'id title',
    });
  }

  it('Refuse delete message for superuser role', async function () {
    await validateDeleteAccessControlFor(testSuperUser);
  });

  it('Refuse delete message for admin role', async function () {
    await validateDeleteAccessControlFor(testAdmin);
  });

  it('Refuse delete message for user role', async function () {
    await validateDeleteAccessControlFor(testUser);
  });

  async function validateDeleteAccessControlFor(user: BaseItem): Promise<void> {
    const message: BaseItem = await givenPersistedRandomMessage(testConfig, user, user);

    try {
      await whenDeleteMessageByUser(message, user);
      expect.fail();
    } catch (error) {
      expect(isAccessDeniedError(error)).to.be.true;
      expect(isAccessDeniedErrorForOperationDelete(error)).to.be.true;
    }
  }

  async function whenDeleteMessageByUser(message: BaseItem, user: BaseItem): Promise<void> {
    givenLoggedIn(testConfig, user);

    await testConfig.args.context.query.Message.deleteOne({
      where: { id: message.id.toString() },
    });
  }

  it('Allow query all messages for superuser role', async function () {
    await validateCanQueryMessageTo(testSuperUser, testSuperUser);
    await validateCanQueryMessageTo(testSuperUser, testAdmin);
    await validateCanQueryMessageTo(testSuperUser, testUser);
  });

  it('Allow query only received messages for admin role', async function () {
    await validateCannotQueryMessageTo(testAdmin, testSuperUser);
    await validateCanQueryMessageTo(testAdmin, testAdmin);
    await validateCannotQueryMessageTo(testAdmin, testUser);
  });

  it('Allow query only received messages for user role', async function () {
    await validateCannotQueryMessageTo(testUser, testSuperUser);
    await validateCannotQueryMessageTo(testUser, testAdmin);
    await validateCanQueryMessageTo(testUser, testUser);
  });

  async function validateCanQueryMessageTo(user: BaseItem, toUser: BaseItem): Promise<void> {
    const targetMessage: BaseItem = await givenPersistedRandomMessage(testConfig, toUser, toUser);
    givenLoggedIn(testConfig, user);

    const messages = await testConfig.args.context.query.Message.findMany({
      where: { id: { equals: targetMessage.id.toString() } },
      query: 'id title to { id }',
    });
    expect(messages).not.to.be.null;
    expect(messages).to.have.length(1);
    expect(messages[0].to.id as string).to.equal(toUser.id);
  }

  async function validateCannotQueryMessageTo(user: BaseItem, toUser: BaseItem): Promise<void> {
    const targetMessage: BaseItem = await givenPersistedRandomMessage(testConfig, toUser, toUser);
    givenLoggedIn(testConfig, user);

    const messages = await testConfig.args.context.query.Message.findMany({
      where: { id: { equals: targetMessage.id.toString() } },
      query: 'id title to { id }',
    });
    expect(messages).not.to.be.null;
    expect(messages).to.have.length(0);
  }

  it('Allow query messages sent by me for admin role', async function () {
    await validateCanQueryMessageToIfFromMe(testAdmin, testSuperUser);
    await validateCanQueryMessageToIfFromMe(testAdmin, testAdmin);
    await validateCanQueryMessageToIfFromMe(testAdmin, testUser);
  });

  it('Allow query messages sent by me for user role', async function () {
    await validateCanQueryMessageToIfFromMe(testUser, testSuperUser);
    await validateCanQueryMessageToIfFromMe(testUser, testAdmin);
    await validateCanQueryMessageToIfFromMe(testUser, testUser);
  });

  async function validateCanQueryMessageToIfFromMe(user: BaseItem, toUser: BaseItem): Promise<void> {
    const targetMessage: BaseItem = await givenPersistedRandomMessage(testConfig, user, toUser);
    givenLoggedIn(testConfig, user);

    const messages = await testConfig.args.context.query.Message.findMany({
      where: { id: { equals: targetMessage.id.toString() } },
      query: 'id title to { id }',
    });
    expect(messages).not.to.be.null;
    expect(messages).to.have.length(1);
    if (user.id !== toUser.id) {
      expectToPropertyToBeNullEvenIfQueriedBecauseUsersDoNotHaveAccessToOtherUserInfo(messages[0] as BaseItem);
    }
  }
});

function expectToPropertyToBeNullEvenIfQueriedBecauseUsersDoNotHaveAccessToOtherUserInfo(message: BaseItem) {
  expect(message.to).to.be.null;
}
