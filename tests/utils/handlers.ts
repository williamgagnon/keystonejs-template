import { rest } from 'msw';

export const ERROR_400_URL = 'http://localhost/dummy';

export const handlers = [
  rest.get(ERROR_400_URL, (req, res, ctx) => {
    return res(ctx.status(400));
  }),
];
