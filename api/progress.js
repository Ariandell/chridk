import { kv } from '@vercel/kv';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  let payload;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = payload.sub; // The unique Google user ID
  const kvKey = `user_progress_${userId}`;

  if (req.method === 'GET') {
    try {
      const history = await kv.get(kvKey) || [];
      return res.status(200).json({ history });
    } catch (error) {
      console.error('KV get error:', error);
      return res.status(500).json({ error: 'Failed to retrieve progress' });
    }
  }

  if (req.method === 'POST') {
    const { history } = req.body;
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'Invalid history data format' });
    }

    try {
      await kv.set(kvKey, history);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('KV set error:', error);
      return res.status(500).json({ error: 'Failed to save progress' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
