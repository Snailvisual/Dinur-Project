"use client";

import React, { useState, useEffect } from "react";

function generatePassword(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function RegisterPage() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [invoice, setInvoice] = useState("");
  const [success, setSuccess] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (success) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = "/login"; // Ganti dengan logika internal yang sesuai
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [success]);

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!nama || !email || !wa || !invoice) {
      alert("Semua field wajib diisi.");
      return;
    }
    // Cek email sudah terdaftar
    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (users.some((u: any) => u.email === email)) {
      alert("Email sudah terdaftar, login atau lupa password");
      return;
    }
    const password = generatePassword();
    setGeneratedPassword(password);
    setSuccess(true);
    // Kirim email konfirmasi ke user
    fetch("/api/send-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    // Simulasi alert (bisa dihapus jika email sudah real)
    setTimeout(() => {
      alert(`Email konfirmasi pendaftaran sudah dikirim ke ${email} dengan password: ${password}`);
    }, 500);
    // Simpan data user ke localStorage
    const newUser = { nama, email, wa, invoice, password };
    users.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(users));
  }

  return (
    <div 
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.0)' }}
      onClick={() => window.location.href = "/login"} // Ganti dengan logika internal yang sesuai
    >
      <div className="bg-white boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' rounded-lg shadow p-8 w-full max-w-md" style={{ background: 'rgba(255,255,255,0.85)' }} onClick={e => e.stopPropagation()}>
        <h1 className="text-2xl font-bold mb-6 text-[#56ad9c] text-center">Form Pendaftaran</h1>
        {!success ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="border rounded px-3 py-2 w-full"
              value={nama}
              onChange={e => setNama(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="border rounded px-3 py-2 w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="No. Whatsapp"
              className="border rounded px-3 py-2 w-full"
              value={wa}
              onChange={e => setWa(e.target.value)}
            />
            <input
              type="text"
              placeholder="No. Invoice Pembelian Produk"
              className="border rounded px-3 py-2 w-full"
              value={invoice}
              onChange={e => setInvoice(e.target.value)}
            />
            <button type="submit" className="w-full py-2 rounded bg-[#56ad9c] text-white font-bold">Daftar</button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#56ad9c] mb-4">Pendaftaran Berhasil!</h2>
            <p className="mb-2">Email konfirmasi sudah dikirim ke <span className="font-semibold">{email}</span>.</p>
            <p className="mb-2">Password untuk login: <span className="font-semibold">{generatedPassword}</span></p>
            <p className="text-sm text-gray-500 mb-4">Silakan cek email Anda untuk detail login.</p>
            <p className="text-sm text-gray-500 mb-4">Halaman akan ditutup otomatis dalam <span className="font-semibold">{countdown}</span> detik.</p>
          </div>
        )}
      </div>
    </div>
  );
}
