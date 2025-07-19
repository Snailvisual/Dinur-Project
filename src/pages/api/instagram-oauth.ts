import type { NextApiRequest, NextApiResponse } from 'next';

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID!;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET!;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }
  try {
    // Exchange code for access_token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ error: 'Failed to get access_token', details: tokenData });
    }
    // Optionally: fetch user info or long-lived token here
    return res.status(200).json(tokenData);
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error', details: e });
  }
}
