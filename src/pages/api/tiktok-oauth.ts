import type { NextApiRequest, NextApiResponse } from 'next';

const TIKTOK_CLIENT_KEY = "aw53k1vvh289o7jv"; // Ganti dengan client key Anda
const TIKTOK_CLIENT_SECRET = "j269yYGA4Mw9FjBowtq4un1P7xznljVd"; // Ganti dengan client secret Anda

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { code, redirect_uri } = req.body;
  // PKCE: get code_verifier from client
  const code_verifier = req.body.code_verifier;
  if (!code || !redirect_uri || !code_verifier) {
    return res.status(400).json({ error: 'Missing code, redirect_uri, or code_verifier' });
  }
  try {
    const params = new URLSearchParams();
    params.append('client_key', TIKTOK_CLIENT_KEY);
    params.append('client_secret', TIKTOK_CLIENT_SECRET);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirect_uri);
    params.append('code_verifier', code_verifier);

    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await response.json();
    if (data.access_token) {
      return res.status(200).json({ access_token: data.access_token, refresh_token: data.refresh_token, expires_in: data.expires_in });
    } else {
      return res.status(400).json({ error: data.error_description || 'Failed to get access_token', details: data });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err });
  }
}
