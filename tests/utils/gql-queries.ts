import type { BaseItem } from '@keystone-6/core/types';
import { Request } from 'autocannon';
import axios, { AxiosResponse } from 'axios';
import { ResponseCodes } from 'http-constants-ts';
import gql from 'nanographql';
import { MessageData } from '../../src/domains/message/message-typings';
import { INITIAL_SUPER_USER_EMAIL, TEST_USERS_PASSWORD } from '../../src/domains/user/user-typings';

export const END_POINT = 'http://localhost:80';
export const SIGNIN = '/signin';
export const API = '/api/graphql';
export const DEFAULT_HEADERS = {
  'content-type': 'application/json',
  'Cache-Control': 'no-cache',
};

// Extending the type library which is incomplete.
export interface RequestEx extends Request {
  setupRequest: (request: RequestEx, context: object) => RequestEx;
}

export const loginQuery = gql`
  mutation ($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      __typename
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          id
          name
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;

export interface LoginInfo {
  user: BaseItem;
  sessionToken: string;
}

export const login = async function (): Promise<LoginInfo> {
  const response: AxiosResponse = await callApiWith(
    loginQuery({ email: INITIAL_SUPER_USER_EMAIL, password: TEST_USERS_PASSWORD }),
  );
  const user = response.data.data.authenticateUserWithPassword.item;
  const sessionToken = response.data.data.authenticateUserWithPassword.sessionToken;

  return { user, sessionToken };
};

export const messagesQuery = gql`
  query {
    messages(take: 25) {
      id
      category
      from {
        name
      }
    }
  }
`;

export const messages = async function (): Promise<BaseItem[]> {
  const response: AxiosResponse = await callApiWith(messagesQuery());
  return response.data.data.messages as BaseItem[];
};

export const createMessageQuery = gql`
  mutation ($data: MessageCreateInput!) {
    createMessage(data: $data) {
      id
      title
    }
  }
`;

export const createMessage = async function (messageData: MessageData): Promise<BaseItem> {
  const response: AxiosResponse = await callApiWith(createMessageQuery({ data: messageData }));
  return response.data.data as BaseItem;
};

const callApiWith = async function (data: string): Promise<AxiosResponse> {
  let response: AxiosResponse;

  try {
    response = await axios.post(END_POINT + API, data, {
      headers: DEFAULT_HEADERS,
    });

    if (response.status !== ResponseCodes.OK) {
      throw new Error(response.data);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }

  return response;
};
