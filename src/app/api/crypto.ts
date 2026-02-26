import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle server-side logic here if needed
  res.status(200).json({ message: 'Crypto API route' });
}
