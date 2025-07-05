import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    return res.status(204).end();
  }

  res.status(404).end();
}
