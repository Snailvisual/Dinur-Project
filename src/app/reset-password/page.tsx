"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const token = searchParams?.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    // Simulasi update password di localStorage (production: update DB via API)
    let users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    let found = false;
    users = users.map((u: any) => {
      if (u.email === email) {
        found = true;
        return { ...u, password: newPassword, passwordChanged: true };
      }
      return u;
    });
    if (!found) {
      setError("User tidak ditemukan.");
      return;
    }
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    setSuccess("Password berhasil direset. Silakan login dengan password baru.");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="rounded-lg shadow p-8 w-full" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', maxWidth: '400px', background: 'rgba(255,255,255,0.85)' }}>
        <h1 className="text-2xl font-bold mb-2 text-[#56ad9c] text-center">Reset Password</h1>
        <p className="text-center text-gray-600 mb-6 text-sm">Masukkan password baru Anda di bawah ini. Password minimal 6 karakter. Setelah berhasil, Anda akan diarahkan ke halaman login.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" value={email} />
          <input type="hidden" value={token} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password baru"
            className="border rounded px-3 py-2 w-full"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Konfirmasi password baru"
            className="border rounded px-3 py-2 w-full"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />
            Tampilkan password
          </label>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button type="submit" className="w-full py-2 rounded bg-[#56ad9c] text-white font-bold">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
