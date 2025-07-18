"use client";

import React, { useState } from "react";
import RegisterPage from "../register/page";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage({ onShowRegister, onLoginSuccess }: { onShowRegister?: () => void; onLoginSuccess?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changeError, setChangeError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    // Validasi login dengan database registeredUsers
    let users;
    try {
      users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (!Array.isArray(users)) throw new Error("Database user rusak.");
    } catch (err) {
      setError("Database user tidak ditemukan atau rusak. Silakan daftar ulang atau hubungi admin.");
      return;
    }
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) {
      // Cek apakah email terdaftar
      const emailExists = users.some((u: any) => u.email === email);
      if (!emailExists) {
        setError("Email tidak terdaftar. Silakan daftar terlebih dahulu.");
      } else {
        setError("Password salah. Silakan coba lagi.");
      }
      return;
    }
    // Cek apakah user sudah pernah ganti password
    if (found.passwordChanged) {
      // Langsung login tanpa popup ganti password
      localStorage.setItem("currentUser", JSON.stringify(found));
      setShowSuccess(true);
      setError("");
      if (onLoginSuccess) onLoginSuccess();
      setTimeout(() => {
        window.location.href = "/profil";
      }, 2000);
      return;
    }
    // Tampilkan popup ganti password hanya jika belum pernah ganti password
    setShowChangePassword(true);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setChangeError("Password baru minimal 6 karakter.");
      return;
    }
    // Update password dan tandai sudah ganti password di database
    let users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    users = users.map((u: any) => {
      if (u.email === email) {
        return { ...u, password: newPassword, passwordChanged: true };
      }
      return u;
    });
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    // Simpan user login dengan password baru dan flag passwordChanged
    const updatedUser = users.find((u: any) => u.email === email);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setShowChangePassword(false);
    setShowSuccess(true);
    setError("");
    setChangeError("");
    if (onLoginSuccess) onLoginSuccess();
    setTimeout(() => {
      window.location.href = "/profil";
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="rounded-lg shadow p-8 w-full" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', maxWidth: '400px', background: 'transparent' }}>
        <h1 className="text-2xl font-bold mb-6 text-[#56ad9c] text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2 w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border rounded px-3 py-2 w-full pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#56ad9c] text-lg focus:outline-none"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full py-2 rounded bg-[#56ad9c] text-white font-bold">Masuk</button>
          <button
            type="button"
            onClick={() => onShowRegister ? onShowRegister() : setShowRegister(true)}
            className="w-full py-2 rounded bg-white text-[#56ad9c] font-bold border border-[#56ad9c] mt-2"
          >
            Daftar
          </button>
          <div className="w-full text-right mt-2">
            <button type="button" className="text-[#56ad9c] text-sm font-semibold hover:underline" onClick={() => alert('Fitur lupa password belum diimplementasikan.')}>Lupa password?</button>
          </div>
        </form>
        {showRegister && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.2)' }}
            onClick={() => setShowRegister(false)}
          >
            <div
              className="bg-white rounded-lg shadow p-8 w-full max-w-md relative"
              style={{ background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}
              onClick={e => e.stopPropagation()}
            >
              <RegisterPage onCancel={() => setShowRegister(false)} />
            </div>
          </div>
        )}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.2)' }}>
            <div className="bg-white rounded-lg shadow p-8 w-full max-w-md relative flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
              <h2 className="text-xl font-bold mb-4 text-[#56ad9c]">Login berhasil!</h2>
              <p className="text-gray-700 mb-2 text-center">Anda akan diarahkan ke halaman profil...</p>
            </div>
          </div>
        )}
        {showChangePassword && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.2)' }}>
            <div className="bg-white rounded-lg shadow p-8 w-full max-w-md relative flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
              <h2 className="text-xl font-bold mb-4 text-[#56ad9c]">Ganti Password Baru</h2>
              <form onSubmit={handleChangePassword} className="w-full flex flex-col gap-4">
                <input
                  type="password"
                  placeholder="Password baru"
                  className="border rounded px-3 py-2 w-full"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                {changeError && <div className="text-red-500 text-sm">{changeError}</div>}
                <button type="submit" className="w-full py-2 rounded bg-[#56ad9c] text-white font-bold">Simpan Password</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
