import type { BaseItem } from '@keystone-6/core/types';
import { requiresAuthenticatedUser, requiresSuperUserRole, Session } from '../../utils/access-utils';
import { UserData, UserRole } from './user-typings';

export function operationQueryAccessRules(session: Session): boolean {
  return requiresAuthenticatedUser(session);
}

export function operationCreateAccessRules(session: Session): boolean {
  return requiresAuthenticatedUser(session) && requiresSuperUserRole(session);
}

export function operationUpdateAccessRules(session: Session): boolean {
  return requiresAuthenticatedUser(session);
}

export function filterQueryAccessRules(session: Session): boolean | object {
  let result: boolean | object = false;

  if (requiresAuthenticatedUser(session)) {
    result = requiresSuperUserRole(session);
    if (!result) {
      result = nonSuperUserRoleOnlySeesTheirOwnUserProfile(session);
    }
  }

  return result;
}

function nonSuperUserRoleOnlySeesTheirOwnUserProfile(session: Session): boolean | object {
  return { id: { equals: session.data.id } };
}

export function itemCreateAccessRules(session: Session, inputData: UserData): boolean {
  return createUserWithRoleSuperUserRequiresRoleSuperUser(session, inputData);
}

function createUserWithRoleSuperUserRequiresRoleSuperUser(session: Session, inputData: UserData): boolean {
  let result = false;
  const userData: UserData = inputData;

  if (userData.role === UserRole.superuser) {
    result = session?.data.role === UserRole.superuser;
  } else {
    result = true;
  }

  return result;
}

export function itemUpdateAccessRules(session: Session, inputData: UserData, item: BaseItem): boolean {
  return (
    requiresSuperUserRole(session) ||
    (requiresUserIsUpdatingOwnUserProfile(session, inputData, item) && requiresNoChangeToUserRoleType(session, inputData, item))
  );
}

function requiresUserIsUpdatingOwnUserProfile(session: Session, inputData: UserData, item: BaseItem): boolean {
  return item.id === session.data.id;
}
function requiresNoChangeToUserRoleType(session: Session, inputData: UserData, item: BaseItem): boolean {
  return inputData.role === undefined || inputData.role === item.role;
}
