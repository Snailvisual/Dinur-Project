import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: 'cs.socialflow@gmail.com',
      to: email,
      subject: 'Konfirmasi Pendaftaran SocialFlow',
      html: `<p>Halo,</p>
        <p>Terima kasih telah mendaftar di SocialFlow.</p>
        <p>Password untuk login Anda: <b>${password}</b></p>
        <p>Silakan login ke aplikasi menggunakan email dan password di atas.</p>
        <br><p>Salam,<br>Tim SocialFlow</p>`
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
