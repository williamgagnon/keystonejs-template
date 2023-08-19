import { requiresAuthenticatedUser, requiresSuperUserRole, Session } from '../../utils/access-utils';

export function operationQueryAccessRules(session: Session): boolean {
  return requiresAuthenticatedUser(session);
}

export function operationCreateAccessRules(session: Session): boolean {
  return requiresAuthenticatedUser(session) && requiresSuperUserRole(session);
}

export function filterQueryAccessRules(session: Session): boolean | object {
  let result: boolean | object = false;

  if (requiresAuthenticatedUser(session)) {
    result = requiresSuperUserRole(session);
    if (!result) {
      result = nonSuperUserRoleOnlySeeMessagesTheySentOrReceived(session);
    }
  }

  return result;
}

function nonSuperUserRoleOnlySeeMessagesTheySentOrReceived(session: Session): boolean | object {
  return { OR: [{ from: { id: { equals: session.data.id } } }, { to: { id: { equals: session.data.id } } }] };
}
