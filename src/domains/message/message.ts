import { list } from '@keystone-6/core';
import { relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { Session } from '../../utils/access-utils';
import { filterQueryAccessRules, operationCreateAccessRules, operationQueryAccessRules } from './message-access';
import { MessageCategory } from './message-typings';

export const message = list({
  access: {
    operation: {
      create: function ({ session }): boolean {
        return operationCreateAccessRules(session as Session);
      },
      query: function ({ session }): boolean {
        return operationQueryAccessRules(session as Session);
      },
      update: () => false,
      delete: () => false,
    },
    filter: {
      query: function ({ session }): boolean | object {
        return filterQueryAccessRules(session as Session);
      },
    },
  },
  fields: {
    category: select({
      type: 'string',
      options: [
        { label: 'Login', value: MessageCategory.login },
        { label: 'Consultation', value: MessageCategory.access },
        { label: 'Communication', value: MessageCategory.communication },
      ],
      defaultValue: MessageCategory.access,
      validation: { isRequired: true },
      isIndexed: true,
      isFilterable: true,
    }),
    from: relationship({
      ref: 'User.outbox',
      many: false,
    }),
    to: relationship({
      ref: 'User.inbox',
      many: false,
    }),
    title: text({
      validation: { isRequired: true },
    }),
    plain: text({}),
    rich: document({
      formatting: {
        inlineMarks: {
          bold: true,
          code: true,
        },
        listTypes: {
          ordered: true,
          unordered: true,
        },
        alignment: {
          center: true,
          end: true,
        },
        headingLevels: [1, 2, 3],
        blockTypes: {
          blockquote: true,
          code: true,
        },
        softBreaks: true,
      },
      relationships: {
        mention: {
          kind: 'inline',
          listKey: 'User',
          label: 'Mention',
          selection: 'id name',
        },
      },
    }),
    createdAt: timestamp({
      validation: {
        isRequired: true,
      },
    }),
  },
  hooks: {
    validateInput: ({ operation, resolvedData, addValidationError }) => {
      if (
        (operation === 'create' && resolvedData.from === undefined) ||
        (operation === 'update' && resolvedData.from !== undefined && resolvedData.from.disconnect)
      ) {
        addValidationError("message.from.not.null:L''auteur du message est requis.");
      }
      if (
        (operation === 'create' && resolvedData.to === undefined) ||
        (operation === 'update' && resolvedData.to !== undefined && resolvedData.to.disconnect)
      ) {
        addValidationError('message.to.not.null:Le destinataire du message est requis.');
      }
    },
  },
  ui: {
    listView: {
      initialColumns: ['category', 'title', 'plain', 'from'],
    },
  },
});
