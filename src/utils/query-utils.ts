import type { BaseItem } from '@keystone-6/core/types';

export type relationshipConnectValue = { connect: { id: { toString(): string } } };
export type relationshipDisconnectValue = { disconnect: true };

export const connectToValue = (item: BaseItem): relationshipConnectValue => {
  return { connect: { id: item.id } };
};
export const disconnectFromValue = (): relationshipDisconnectValue => {
  return { disconnect: true };
};
