import { relationshipConnectValue, relationshipDisconnectValue } from '../../utils/query-utils';

export enum MessageCategory {
  login = 'login',
  access = 'access',
  communication = 'communication',
}

export type MessageData = {
  category?: string;
  from?: relationshipConnectValue | relationshipDisconnectValue;
  to?: relationshipConnectValue | relationshipDisconnectValue;
  title?: string;
  plain?: string;
  createdAt?: string;
};
