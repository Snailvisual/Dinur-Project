// pages/api/tiktok-analytics.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { access_token } = req.query; // access_token user TikTok

  // Contoh: Fetch statistik video
  const resp = await fetch('https://open.tiktokapis.com/v1.3/video/data/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // parameter sesuai endpoint TikTok
    }),
  });

  const data = await resp.json();
  res.status(200).json(data);
}