import type { BaseItem } from '@keystone-6/core/types';
import { expect } from 'chai';
import { MessageData } from '../src/domains/message/message-typings';
import { connectToValue, disconnectFromValue } from '../src/utils/query-utils';
import {
  givenLoggedIn,
  givenPersistedRandomMessage,
  givenRandomMessageData,
  givenTestSuperUser,
} from './utils/given-pre-conditions';
import { setupKeystoneTests, TestConfig } from './utils/test-builder';

describe('Message list validations', function () {
  let testConfig: TestConfig;
  let testSuperUser: BaseItem;

  before(async function () {
    testConfig = await setupKeystoneTests();
    testSuperUser = await givenTestSuperUser(testConfig);
  });

  it('Generates error if message from and to fields not set on create', async function () {
    try {
      givenLoggedIn(testConfig, testSuperUser);
      const messageData: MessageData = givenRandomMessageData();

      await testConfig.args.context.query.Message.createOne({
        data: messageData,
      });
      expect.fail();
    } catch (e) {
      expect((e as Error).message).to.contain('message.from.not.null');
      expect((e as Error).message).to.contain('message.to.not.null');
    }
  });

  it('Generates error if message from field not set on create', async function () {
    try {
      givenLoggedIn(testConfig, testSuperUser);
      const messageData = givenRandomMessageData();
      messageData.to = connectToValue(testSuperUser);

      await testConfig.args.context.query.Message.createOne({
        data: messageData,
      });
      expect.fail();
    } catch (e) {
      expect((e as Error).message).to.contain('message.from.not.null');
      expect((e as Error).message).to.not.contain('message.to.not.null');
    }
  });

  it('Generates error if message to field not set on create', async function () {
    try {
      givenLoggedIn(testConfig, testSuperUser);
      const messageData = givenRandomMessageData();
      messageData.from = connectToValue(testSuperUser);

      await testConfig.args.context.query.Message.createOne({
        data: messageData,
      });
      expect.fail();
    } catch (e) {
      expect((e as Error).message).to.contain('message.to.not.null');
      expect((e as Error).message).to.not.contain('message.from.not.null');
    }
  });

  it('Succeeds if message from and to fields are set on create', async function () {
    try {
      givenLoggedIn(testConfig, testSuperUser);
      const messageData = givenRandomMessageData();
      messageData.from = connectToValue(testSuperUser);
      messageData.to = connectToValue(testSuperUser);

      await testConfig.args.context.query.Message.createOne({
        data: messageData,
      });
    } catch (e) {
      expect.fail();
    }
  });

  it('Generates error if message from and to fields are unset on update', async function () {
    try {
      givenLoggedIn(testConfig, testSuperUser);
      const message = await givenPersistedRandomMessage(testConfig, testSuperUser, testSuperUser);
      const updateData: MessageData = {
        from: disconnectFromValue(),
        to: disconnectFromValue(),
      };

      await messagesCanOnlyBeUpdatedWithSudoBecauseTheyAreImmutable(message as BaseItem, updateData);
      expect.fail();
    } catch (e) {
      expect((e as Error).message).to.contain('message.from.not.null');
      expect((e as Error).message).to.contain('message.to.not.null');
    }
  });

  it('Generates error if message from field is unset on update', async function () {
    try {
      givenLoggedIn(testConfig, testSuperUser);
      const message = await givenPersistedRandomMessage(testConfig, testSuperUser, testSuperUser);
      const updateData: MessageData = {
        from: disconnectFromValue(),
      };

      await messagesCanOnlyBeUpdatedWithSudoBecauseTheyAreImmutable(message as BaseItem, updateData);
      expect.fail();
    } catch (e) {
      expect((e as Error).message).to.contain('message.from.not.null');
      expect((e as Error).message).to.not.contain('message.to.not.null');
    }
  });

  it('Generates error if message to field is unset on update', async function () {
    try {
      givenLoggedIn(testConfig, testSuperUser);
      const message = await givenPersistedRandomMessage(testConfig, testSuperUser, testSuperUser);
      const updateData: MessageData = {
        to: disconnectFromValue(),
      };

      await messagesCanOnlyBeUpdatedWithSudoBecauseTheyAreImmutable(message as BaseItem, updateData);
      expect.fail();
    } catch (e) {
      expect((e as Error).message).to.not.contain('message.from.not.null');
      expect((e as Error).message).to.contain('message.to.not.null');
    }
  });

  async function messagesCanOnlyBeUpdatedWithSudoBecauseTheyAreImmutable(
    message: BaseItem,
    updateData: MessageData,
  ): Promise<void> {
    await testConfig.args.context.sudo().query.Message.updateOne({
      where: { id: message.id.toString() },
      data: updateData,
    });
  }
});
