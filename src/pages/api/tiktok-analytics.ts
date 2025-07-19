// pages/api/tiktok-analytics.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { access_token } = req.query; // access_token user TikTok

  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token' });
  }

  try {
    // Example: Fetch user video list (replace with actual TikTok endpoint and params as needed)
    const resp = await fetch('https://open.tiktokapis.com/v1.3/video/list/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add required parameters for TikTok API here
        // For demo, limit to 10 videos
        max_count: 10,
      }),
    });

    if (!resp.ok) {
      const error = await resp.text();
      return res.status(resp.status).json({ error });
    }

    const data = await resp.json();
    // Example response structure: { data: { videos: [ { like_count, comment_count, share_count, view_count, create_time }, ... ] } }
    const videos = data?.data?.videos || [];
    if (!Array.isArray(videos) || videos.length === 0) {
      return res.status(200).json({ er: null, date: null, message: 'No videos found' });
    }

    // Calculate engagement rate: (likes + comments + shares) / views * 100, averaged over videos
    let totalER = 0;
    let count = 0;
    let latestDate = null;
    for (const v of videos) {
      const views = v.view_count || 0;
      if (views > 0) {
        const er = ((v.like_count || 0) + (v.comment_count || 0) + (v.share_count || 0)) / views * 100;
        totalER += er;
        count++;
        if (!latestDate || v.create_time > latestDate) latestDate = v.create_time;
      }
    }
    const avgER = count > 0 ? (totalER / count) : null;
    // Convert latestDate (epoch) to ISO string if present
    const date = latestDate ? new Date(latestDate * 1000).toISOString() : null;

    res.status(200).json({ er: avgER, date });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch TikTok analytics', details: err instanceof Error ? err.message : err });
  }
}