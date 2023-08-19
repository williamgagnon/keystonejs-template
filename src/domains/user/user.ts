import { list } from '@keystone-6/core';
import { password, relationship, select, text } from '@keystone-6/core/fields';
import { Session } from '../../utils/access-utils';
import {
  filterQueryAccessRules,
  itemCreateAccessRules,
  itemUpdateAccessRules,
  operationCreateAccessRules,
  operationQueryAccessRules,
  operationUpdateAccessRules,
} from './user-access';
import { UserData, UserRole } from './user-typings';

export const user = list({
  access: {
    operation: {
      create: function ({ session }): boolean {
        return operationCreateAccessRules(session as Session);
      },
      query: function ({ session }): boolean {
        return operationQueryAccessRules(session as Session);
      },
      update: function ({ session }): boolean {
        return operationUpdateAccessRules(session as Session);
      },
      delete: () => false,
    },
    filter: {
      query: function ({ session }): boolean | object {
        return filterQueryAccessRules(session as Session);
      },
    },
    item: {
      create: ({ session, inputData }): boolean => {
        return itemCreateAccessRules(session as Session, inputData as UserData);
      },
      update: ({ session, inputData, item }): boolean => {
        return itemUpdateAccessRules(session as Session, inputData as UserData, item);
      },
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true,
    }),
    password: password({ validation: { isRequired: true } }),
    role: select({
      type: 'string',
      options: [
        { label: 'Super User', value: UserRole.superuser },
        { label: 'Admin', value: UserRole.admin },
        { label: 'User', value: UserRole.user },
      ],
      defaultValue: UserRole.user,
      validation: { isRequired: true },
      isIndexed: true,
      isFilterable: true,
    }),
    inbox: relationship({
      ref: 'Message.to',
      many: true,
      ui: { displayMode: 'count' },
    }),
    outbox: relationship({
      ref: 'Message.from',
      many: true,
      ui: { displayMode: 'count' },
    }),
  },
  ui: {
    listView: {
      initialColumns: ['name', 'role'],
    },
  },
});
