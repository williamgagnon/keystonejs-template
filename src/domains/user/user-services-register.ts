import { KeystoneContext } from '@keystone-6/core/dist/declarations/src/types';
import { UserData } from './user-typings';

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  context: KeystoneContext,
): Promise<UserData> => {
  const response = await context.sudo().query.User.createOne({
    data: { name: name, email: email, password: password },
    query: 'id name email',
  });

  const result = {
    id: response.id,
    name: response.name,
    email: response.email,
  };

  return result as UserData;
};
