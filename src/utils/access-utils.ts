import { UserRole } from '../domains/user/user-typings';

export type SessionData = {
  id: string;
  name: string;
  role: string;
};

export type Session = {
  data: SessionData;
};

interface GraphqlError extends Error {
  extensions?: {
    code: string;
  };
}

export function requiresAuthenticatedUser(session: Session): boolean {
  return session !== undefined;
}

export function requiresSuperUserRole(session: Session): boolean {
  return session?.data.role === UserRole.superuser;
}

export function isAccessDeniedError(error: unknown): boolean {
  let result = false;
  if ((error as GraphqlError).extensions) {
    result = (error as GraphqlError).extensions?.code === 'KS_ACCESS_DENIED';
  }
  return result;
}

export function isAccessDeniedErrorForOperationCreate(error: unknown): boolean {
  let result = false;
  if (error instanceof Error) {
    result = error.message.includes('operation') && error.message.includes('create');
  }
  return result;
}

export function isAccessDeniedErrorForOperationUpdate(error: unknown): boolean {
  let result = false;
  if (error instanceof Error) {
    result = error.message.includes('operation') && error.message.includes('update');
  }
  return result;
}

export function isAccessDeniedErrorForOperationDelete(error: unknown): boolean {
  let result = false;
  if (error instanceof Error) {
    result = error.message.includes('operation') && error.message.includes('delete');
  }
  return result;
}

export function isAccessDeniedErrorForItemUpdate(error: unknown): boolean {
  let result = false;
  if (error instanceof Error) {
    result = error.message.includes('item') && error.message.includes('update');
  }
  return result;
}
