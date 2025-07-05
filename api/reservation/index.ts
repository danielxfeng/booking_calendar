// Use vercel functions as mock API.
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { generateMockedData } from '../../mock/test';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const start = req.query.start as string;
    const data = generateMockedData(start);
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    return res.status(201).end();
  }

  res.status(404).end();
}
