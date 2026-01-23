import { rest } from 'msw';

export const handlers = [
  rest.post('/api/chat', async (req, res, ctx) => {
    const { message } = await req.json();
    return res(
      ctx.json({
        response: `Mock response to: ${message}`
      })
    );
  })
];