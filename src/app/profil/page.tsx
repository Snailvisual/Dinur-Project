"use client";

import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import LoginPage from "../login/page";
import RegisterPage from "../register/page";
import { useUser } from "../UserContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

export interface UserType {
  name: string;
  email: string;
  photo: string;
  appleId?: string;
  wa?: string;
  password?: string;
  passwordChanged?: boolean;
  locked?: boolean;
}

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editPhoto, setEditPhoto] = useState(user.photo);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editWa, setEditWa] = useState(user.wa || "");
  const [editPassword, setEditPassword] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  function handleLoginSuccess() {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          setUser({
            name: parsed.nama || parsed.name || "Nama User",
            email: parsed.email || "user@email.com",
            photo: parsed.photo || "https://ui-avatars.com/api/?name=" + (parsed.nama || parsed.name || "User") + "&background=56ad9c&color=fff",
            appleId: parsed.appleId || "",
            wa: parsed.wa || "",
          });
        } catch {}
      }
      // Paksa reload agar state dan tampilan sinkron
      window.location.reload();
    }
  }

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Daftarkan akun admin jika belum ada di database
      const adminUser = {
        nama: "Admin",
        email: "admin@gmail.com",
        wa: "08123456789",
        invoice: "ADMIN001",
        password: "snail123",
        photo: "https://ui-avatars.com/api/?name=Admin&background=56ad9c&color=fff",
        appleId: "adminAppleId"
      };
      let users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (!users.some((u: any) => u.email === adminUser.email)) {
        users.push(adminUser);
        localStorage.setItem("registeredUsers", JSON.stringify(users));
      }
      // Ambil data user yang sedang login setiap render
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          setUser({
            name: parsed.name || parsed.nama || "Nama User",
            email: parsed.email || "user@email.com",
            photo: parsed.photo || "https://ui-avatars.com/api/?name=" + (parsed.name || parsed.nama || "User") + "&background=56ad9c&color=fff",
            appleId: parsed.appleId || "",
            wa: parsed.wa || "",
            password: parsed.password || "",
            passwordChanged: parsed.passwordChanged || false,
          });
          setIsLocked(!!parsed.locked);
          setEditName(parsed.name || parsed.nama || "Nama User");
          setEditPhoto(parsed.photo || "https://ui-avatars.com/api/?name=" + (parsed.name || parsed.nama || "User") + "&background=56ad9c&color=fff");
          setEditEmail(parsed.email || "user@email.com");
          setEditWa(parsed.wa || "");
        } catch {}
      } else {
        // fallback ke profileUser
        const saved = localStorage.getItem("profileUser");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser({
              name: parsed.name || parsed.nama || "Nama User",
              email: parsed.email || "user@email.com",
              photo: parsed.photo || "https://ui-avatars.com/api/?name=" + (parsed.name || parsed.nama || "User") + "&background=56ad9c&color=fff",
              appleId: parsed.appleId || "",
              wa: parsed.wa || "",
              password: parsed.password || "",
              passwordChanged: parsed.passwordChanged || false,
            });
            setIsLocked(!!parsed.locked);
            setEditName(parsed.name || parsed.nama || "Nama User");
            setEditPhoto(parsed.photo || "https://ui-avatars.com/api/?name=" + (parsed.name || parsed.nama || "User") + "&background=56ad9c&color=fff");
            setEditEmail(parsed.email || "user@email.com");
            setEditWa(parsed.wa || "");
          } catch {}
        }
      }
    }
  }, []);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setSettingsError('Ukuran file terlalu besar (maksimal 1MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = function (ev) {
        setCropSrc(ev.target?.result as string);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleCropComplete() {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(cropSrc, croppedAreaPixels);
      const img = new window.Image();
      img.onload = function () {
        // Resize & compress hasil crop
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) {
            h = Math.round(h * (maxSize / w));
            w = maxSize;
          }
        } else {
          if (h > maxSize) {
            w = Math.round(w * (maxSize / h));
            h = maxSize;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const byteString = atob(dataUrl.split(',')[1]);
        const byteLength = byteString.length;
        if (byteLength > 500 * 1024) {
          setSettingsError('Foto terlalu besar setelah crop & kompres (maksimal 500KB). Pilih foto lain.');
          setShowCrop(false);
          return;
        }
        setEditPhoto(dataUrl);
        setSettingsError('');
        setShowCrop(false);
      };
      img.onerror = function () {
        setSettingsError('Gagal memproses gambar.');
        setShowCrop(false);
      };
      img.src = croppedImage;
    } catch {
      setSettingsError('Gagal crop gambar.');
      setShowCrop(false);
    }
  }

  function handleSave() {
    // Simpan dengan field 'name', 'nama', dan 'photo' agar konsisten di seluruh aplikasi
    const updated = { ...user, name: editName, nama: editName, photo: editPhoto, locked: true };
    setUser(updated);
    setIsLocked(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("profileUser", JSON.stringify(updated));
      localStorage.setItem("currentUser", JSON.stringify(updated));
      let users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      users = users.map((u: any) => u.email === user.email ? { ...u, name: editName, nama: editName, photo: editPhoto, locked: true } : u);
      localStorage.setItem("registeredUsers", JSON.stringify(users));
      // Tidak perlu reload, Sidebar akan update otomatis
    }
  }

  function handleRemovePhoto() {
    setEditPhoto("");
  }

  const isLoggedIn = !!user.email && user.email !== "user@email.com" && user.name !== "Nama User" && user.email !== "";

  // Tambahkan ref untuk input foto
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  function handlePhotoButtonClick() {
    fileInputRef.current?.click();
  }

  /* Tambahkan style hover pada tombol utama */
  const buttonBase = "transition-all duration-150 hover:scale-105 hover:shadow-lg";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f8f8] to-[#eafaf6]">
      <div className="flex flex-col gap-6 w-full max-w-lg">
        {/* Card Foto Profil */}
        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="flex flex-1 gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex-1 relative flex items-center gap-4">
              {user.photo && (
                <img src={user.photo} alt="Foto Profil" className="w-16 h-16 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <div className="text-lg font-bold text-[#56ad9c]">{user.name}</div>
                <div className="text-sm text-gray-400">Email: <span className="font-semibold text-[#56ad9c]">{user.email}</span></div>
                <div className="text-sm text-gray-400">No. HP: <span className="font-semibold text-[#56ad9c]">{user.wa || '-'}</span></div>
                <div className="text-sm text-gray-400">AppleID: <span className="font-semibold text-[#56ad9c]">{user.appleId || '-'}</span></div>
              </div>
            </div>
          </div>
        </div>
        {/* Card Aksi */}
        <div className="bg-white rounded-xl shadow flex flex-row gap-4 py-6 px-6 justify-center">
          <button className={`px-4 py-2 rounded bg-blue-500 text-white font-bold shadow ${buttonBase}`} onClick={() => setShowSettings(true)}>Setting</button>
          <button className={`px-4 py-2 rounded bg-red-500 text-white font-bold shadow ${buttonBase}`} onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("currentUser");
              window.location.reload();
            }
          }}>Logout</button>
        </div>
      </div>
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-[#56ad9c]">Pengaturan Akun</h2>
            {/* Edit Foto Profil di atas input nama, mirip dashboard */}
            <div className="mb-4 w-full flex flex-col items-center">
              <div className="flex gap-2 items-center">
                <button type="button" className="bg-[#56ad9c] text-white px-2 py-1 rounded text-xs" onClick={handlePhotoButtonClick} disabled={isLocked}>Upload Foto</button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" disabled={isLocked} />
                {editPhoto && (
                  <>
                    <img src={editPhoto} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                    <button type="button" className="text-xs text-red-500" onClick={handleRemovePhoto} title="Hapus Foto">Hapus</button>
                  </>
                )}
              </div>
            </div>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-3"
              placeholder="Nama Akun"
              disabled={isLocked}
            />
            <input
              type="email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-3"
              placeholder="Email"
            />
            <input
              type="text"
              value={editWa}
              onChange={e => setEditWa(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-3"
              placeholder="Nomor HP"
            />
            <input
              type="password"
              value={editPassword}
              onChange={e => setEditPassword(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-3"
              placeholder="Password Baru (min 6 karakter)"
            />
            {settingsError && <div className="text-red-500 text-sm mb-2">{settingsError}</div>}
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-bold transition-all duration-150 hover:scale-105 hover:shadow-lg" onClick={() => setShowSettings(false)}>Batal</button>
              <button className="px-4 py-2 rounded bg-[#56ad9c] text-white font-bold transition-all duration-150 hover:scale-105 hover:shadow-lg" onClick={() => {
                if (!editName || !editEmail) {
                  setSettingsError('Nama dan email wajib diisi.');
                  return;
                }
                if (editPassword && editPassword.length < 6) {
                  setSettingsError('Password minimal 6 karakter.');
                  return;
                }
                // Update data user di localStorage dan context, termasuk foto dan lock
                let updated = { ...user, name: editName, nama: editName, email: editEmail, wa: editWa, photo: editPhoto || user.photo };
                if (editPassword) updated = { ...updated, password: editPassword, passwordChanged: true };
                setUser(updated);
                setEditName(editName);
                setEditEmail(editEmail);
                setEditWa(editWa);
                setEditPhoto(updated.photo); // pastikan preview langsung update
                setEditPassword("");
                setSettingsError("");
                setShowSettings(false);
                if (typeof window !== "undefined") {
                  localStorage.setItem("currentUser", JSON.stringify(updated));
                  localStorage.setItem("profileUser", JSON.stringify(updated));
                  let users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
                  users = users.map((u: any) => u.email === user.email ? { ...u, ...updated } : u);
                  localStorage.setItem("registeredUsers", JSON.stringify(users));
                }
              }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
      {showLogin && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.2)' }}
          onClick={() => setShowLogin(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-[#56ad9c]">Login</h2>
            <div className="w-full">
              <LoginPage />
            </div>
            <div className="flex justify-center mt-4 w-full">
              <button
                type="button"
                className="px-4 py-1 rounded bg-gray-300 text-gray-700 text-sm font-bold shadow"
                style={{ minWidth: 0, width: 'auto' }}
                onClick={() => setShowLogin(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {showCrop && cropSrc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 min-w-[320px] min-h-[320px] flex flex-col items-center">
            <div className="w-full h-64 relative">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
            <div className="flex gap-2 mt-6 justify-center w-full">
              <button className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-bold transition-all duration-150 hover:scale-105 hover:shadow-lg" onClick={() => setShowCrop(false)}>Batal</button>
              <button className="px-4 py-2 rounded bg-[#56ad9c] text-white font-bold transition-all duration-150 hover:scale-105 hover:shadow-lg" onClick={handleCropComplete}>Crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tambahkan komponen LoginPageWithRegisterPopup
function LoginPageWithRegisterPopup({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const [showRegister, setShowRegister] = useState(false);
  return (
    <>
      <LoginPage />
      {showRegister && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.0)' }}
          onClick={() => setShowRegister(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
          >
            <RegisterPage />
          </div>
        </div>
      )}
    </>
  );
}
// Hapus interface LoginPageProps karena tidak digunakan dan tidak boleh ada default export dengan props di page App Router

