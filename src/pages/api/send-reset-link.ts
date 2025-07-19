import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  // Cari user di local database (simulasi, production harus ke DB beneran)
  // Di sini hanya cek registeredUsers di localStorage, pada real backend harus query DB
  // Untuk demo, selalu sukses

  // Generate token reset (random string)
  const token = Math.random().toString(36).substr(2, 32);
  // Simpan token ke DB (atau cache, atau email saja untuk demo)

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

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await transporter.sendMail({
      from: 'cs.socialflow@gmail.com',
      to: email,
      subject: 'Reset Password SocialFlow',
      html: `<p>Halo,</p>
        <p>Kami menerima permintaan reset password untuk akun SocialFlow Anda.</p>
        <p>Klik link berikut untuk mengganti password aplikasi Anda:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <br><p>Salam,<br>Tim SocialFlow</p>`
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
