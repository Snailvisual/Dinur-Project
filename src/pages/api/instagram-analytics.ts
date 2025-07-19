import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { access_token } = req.query;
  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token' });
  }
  try {
    // Fetch user profile
    const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${access_token}`);
    const user = await userRes.json();
    // Fetch user insights (media)
    const mediaRes = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,username,permalink,like_count,comments_count&access_token=${access_token}`);
    const media = await mediaRes.json();
    // Optionally: fetch insights for each media (requires business account)
    return res.status(200).json({ user, media });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch Instagram insights', details: e });
  }
}
