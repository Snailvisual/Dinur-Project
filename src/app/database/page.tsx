"use client";

import React, { useEffect, useState } from "react";

interface UserData {
  nama: string;
  email: string;
  wa: string;
  invoice: string;
  password: string;
}

export default function DatabasePage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);

  useEffect(() => {
    // Cek user login dari localStorage
    let currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    // Jika belum ada akun admin, buat default admin
    if (!currentUser) {
      const adminUser = {
        nama: "Admin",
        email: "admin@gmail.com",
        wa: "08123456789",
        invoice: "ADMIN001",
        password: "admin123"
      };
      localStorage.setItem("currentUser", JSON.stringify(adminUser));
      // Tambahkan ke registeredUsers jika belum ada
      let registered = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (!registered.some((u: any) => u.email === "admin@admin.com")) {
        registered.push(adminUser);
        localStorage.setItem("registeredUsers", JSON.stringify(registered));
      }
      currentUser = adminUser;
    }
    if (currentUser?.email === "admin@admin.com") {
      setIsAdmin(true);
      const data = localStorage.getItem("registeredUsers");
      if (data) {
        setUsers(JSON.parse(data));
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Akses Ditolak</h1>
          <p className="text-gray-700 mb-6">Halaman ini hanya bisa diakses oleh admin.</p>
          <button
            className="px-4 py-2 rounded bg-[#56ad9c] text-white font-bold shadow mr-2"
            onClick={() => {
              // Set currentUser ke admin dan reload
              const adminUser = {
                nama: "Admin",
                email: "admin@admin.com",
                wa: "08123456789",
                invoice: "ADMIN001",
                password: "admin123"
              };
              localStorage.setItem("currentUser", JSON.stringify(adminUser));
              let registered = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
              if (!registered.some((u: any) => u.email === "admin@admin.com")) {
                registered.push(adminUser);
                localStorage.setItem("registeredUsers", JSON.stringify(registered));
              }
              window.location.reload();
            }}
          >Login sebagai Admin</button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white font-bold shadow"
            onClick={() => window.location.reload()}
          >Buka Halaman Database</button>
        </div>
      </div>
    );
  }

  function handleCheck(idx: number) {
    setCheckedRows(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  }

  function handleDeleteChecked() {
    if (checkedRows.length === 0) return;
    const newUsers = users.filter((_, idx) => !checkedRows.includes(idx));
    setUsers(newUsers);
    setCheckedRows([]);
    // Update localStorage
    localStorage.setItem("registeredUsers", JSON.stringify(newUsers));
  }

  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-[#56ad9c]">Database User Terdaftar</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 rounded bg-red-500 text-white font-bold shadow disabled:opacity-50"
          disabled={checkedRows.length === 0}
          onClick={handleDeleteChecked}
        >Hapus Baris Terpilih</button>
        <button
          className="px-4 py-2 rounded bg-gray-400 text-white font-bold shadow"
          onClick={() => {
            localStorage.removeItem("currentUser");
            window.location.reload();
          }}
        >Hilangkan Akses Admin</button>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-[#56ad9c] text-white">
            <th className="p-2 border">Pilih</th>
            <th className="p-2 border">Nama</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">No. WA</th>
            <th className="p-2 border">Invoice</th>
            <th className="p-2 border">Password</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={6} className="text-center p-4">Belum ada data pendaftaran.</td></tr>
          ) : (
            users.map((user, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={checkedRows.includes(idx)}
                    onChange={() => handleCheck(idx)}
                  />
                </td>
                <td className="p-2 border">{user.nama}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">{user.wa}</td>
                <td className="p-2 border">{user.invoice}</td>
                <td className="p-2 border">{user.password}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
