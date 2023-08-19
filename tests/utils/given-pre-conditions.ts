import { faker } from '@faker-js/faker';
import type { BaseItem } from '@keystone-6/core/types';
import { expect } from 'chai';
import { MessageCategory, MessageData } from '../../src/domains/message/message-typings';
import {
  INITIAL_ADMIN_EMAIL,
  INITIAL_SUPER_USER_EMAIL,
  INITIAL_USER_EMAIL,
  TEST_USERS_PASSWORD,
  UserData,
  UserRole,
} from '../../src/domains/user/user-typings';
import { Session } from '../../src/utils/access-utils';
import { connectToValue } from '../../src/utils/query-utils';
import { TestConfig } from './test-builder';

// Users

export async function givenTestSuperUser(testConfig: TestConfig): Promise<BaseItem> {
  return await findUserByEmail(testConfig, INITIAL_SUPER_USER_EMAIL);
}

export async function givenTestAdmin(testConfig: TestConfig): Promise<BaseItem> {
  return await findUserByEmail(testConfig, INITIAL_ADMIN_EMAIL);
}

export async function givenTestUser(testConfig: TestConfig): Promise<BaseItem> {
  return await findUserByEmail(testConfig, INITIAL_USER_EMAIL);
}

async function findUserByEmail(testConfig: TestConfig, email: string): Promise<BaseItem> {
  const users = await testConfig.args.context.sudo().query.User.findMany({
    where: { email: { equals: email } },
    query: 'id name role',
  });
  expect(users).not.to.be.null;
  expect(users).to.have.length(1);
  return users[0] as BaseItem;
}

export function givenRandomUserRole(): string {
  const roles: string[] = Object.values(UserRole);
  return roles[Math.floor(Math.random() * roles.length)];
}

export function givenRandomUserData(): UserData {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName}.${lastName}@example.com`,
    role: givenRandomUserRole(),
    password: TEST_USERS_PASSWORD,
  };
}

export function givenLoggedIn(testConfig: TestConfig, user: BaseItem): void {
  const session: Session = {
    data: {
      id: user.id.toString(),
      name: user.name as string,
      role: user.role as string,
    },
  };

  testConfig.args.context.session = session;
}

export function givenLoggedOut(testConfig: TestConfig): void {
  delete testConfig.args.context.session;
}

// Messages

export function givenRandomMessageData(): MessageData {
  return {
    category: MessageCategory.access,
    title: faker.lorem.words(3),
    plain: faker.lorem.sentence(),
    createdAt: new Date().toISOString(),
  };
}

export async function givenPersistedRandomMessage(
  testConfig: TestConfig,
  fromUser: BaseItem,
  toUser: BaseItem,
): Promise<BaseItem> {
  const createData = givenRandomMessageData();
  createData.from = connectToValue(fromUser);
  createData.to = connectToValue(toUser);

  const message = await testConfig.args.context.sudo().query.Message.createOne({
    data: createData,
    query: 'id title',
  });

  return message as BaseItem;
}
