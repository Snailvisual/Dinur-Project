'use client';

import React, { Suspense, useState, useEffect } from "react";
import { FaTrashAlt, FaCog } from "react-icons/fa";
import LoginPage from "../login/page";
import RegisterPage from "../register/page";
import { useUser } from "../UserContext";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import Image from "next/image";
import TiktokOAuthSection from "./TiktokOAuthSection";
import InstagramOAuthSection from "./InstagramOAuthSection";

export interface UserType {
  name: string;
  email: string;
  photo: string;
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
  // Tambahkan state untuk igEngagement agar tidak error
  const [igEngagement, setIgEngagement] = useState<{ er: number; date: string } | null>(null);
  // Tambahkan state untuk tiktokEngagement
  const [tiktokEngagement, setTiktokEngagement] = useState<{ er: number; date: string } | null>(null);
  const [location, setLocation] = useState<string>("Kalimantan Selatan, Indonesia");
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // TikTok OAuth2 config
  const TIKTOK_CLIENT_ID = "aw53k1wh289o7jv"; // Client key TikTok asli
  const TIKTOK_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/profil` : "";
  const TIKTOK_SCOPE = "user.info.basic,video.list,video.data,video.comment,video.like";
  // Instagram OAuth2 config
  const INSTAGRAM_CLIENT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || "";
  const INSTAGRAM_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/profil` : "";

  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        // Ambil provinsi (region) dan negara
        const provinsi = data.region || data.region_name || "-";
        const negara = data.country_name || data.country || "-";
        setLocation(`${provinsi}, ${negara}`);
      } catch {
        setLocation("Kalimantan Selatan, Indonesia");
      }
    }
    fetchLocation();
  }, []);

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
  }, [setUser]);

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

  // Layout mirip gambar: 2 kolom besar, kiri profil, kanan analytics, bawah cards
  return (
    <div className="min-h-screen bg-[#f4faf8] py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kiri: Profil utama */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center relative">
            {user.photo && (
              <Image src={user.photo} alt="Foto Profil" className="w-32 h-32 rounded-full object-cover border-4 border-[#eafaf6] shadow" width={112} height={112} />
            )}
            <div className="mt-4 text-2xl font-bold text-[#2ec4b6] text-center">{user.name}</div>
            <div className="text-sm text-gray-400 text-center mb-2">{location}</div>
            <div className="flex flex-wrap justify-center gap-2 text-[#2ec4b6] font-semibold text-base mb-4">
              <span>{user.email}</span>
              <span className="text-gray-300">|</span>
              <span>{user.wa || '089619941101'}</span>
            </div>
            <button className="absolute top-4 right-4 bg-[#f4faf8] rounded-full p-2 shadow hover:scale-105 transition" title="Edit Profil" onClick={() => setShowSettings(true)}>
              <FaCog size={22} color="#2ec4b6" />
            </button>
          </div>
          {/* Engagement Rate Cards */}
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <div className="font-bold text-[#2ec4b6] mb-2">Engagement Rate</div>
            <div className="flex items-center gap-2 mb-1">
              {igEngagement ? (
                <>
                  <span className="font-bold text-lg">ER {igEngagement.er.toFixed(2)}%</span>
                  <span className="text-xs text-gray-400">{igEngagement.date}</span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">Loading...</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-2">{igEngagement ? (
              igEngagement.er < 5 ? "Keep it up! Your ER is Low. It's worse than similar accounts, but it's been increasing over the past 30 days" : "Great! Your ER is above average."
            ) : (
              "Connect Instagram to see your engagement rate."
            )}</div>
            <button className="px-3 py-1 rounded bg-[#2ec4b6] text-white text-xs font-semibold">View ER graph</button>
          </div>
          <div className="bg-white rounded-xl shadow p-4 mt-2">
            <div className="font-bold text-[#2ec4b6] mb-2">Engagement Rate Tiktok</div>
            <div className="flex items-center gap-2 mb-1">
              {tiktokEngagement ? (
                <>
                  <span className="font-bold text-lg">ER {tiktokEngagement.er.toFixed(2)}%</span>
                  <span className="text-xs text-gray-400">{tiktokEngagement.date}</span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">Loading...</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-2">{tiktokEngagement ? (
              tiktokEngagement.er < 5 ? "Keep it up! Your ER is Low. It's worse than similar accounts, but it's been increasing over the past 30 days" : "Great! Your ER is above average."
            ) : (
              "Connect TikTok to see your engagement rate."
            )}</div>
            <button className="px-3 py-1 rounded bg-[#2ec4b6] text-white text-xs font-semibold">View ER graph</button>
          </div>
        </div>
        {/* Kanan: Analytics dan cards */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Social connect card dipindah ke atas, versi baru dengan icon dan tombol kecil memanjang */}
          <div className="bg-white rounded-xl shadow flex flex-col items-right px-25 py-3">
            <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
              <span className="text-[#2ec4b6] font-semibold text-base mb-3 md:mb-0 md:mr-4 whitespace-nowrap">Hubungkan Data :</span>
              <div className="flex flex-row gap-4 w-full md:w-auto justify-end md:justify-end items-stretch ml-auto">
                {/* TikTok */}
                <div className="w-40 h-14 flex items-center justify-center">
                  <Suspense fallback={<div>Loading TikTok integration...</div>}>
                    <TiktokOAuthSection
                      btnClassName="w-full h-3 flex items-center text-sm justify-center rounded bg-black text-white font-medium shadow text-base transition-all duration-150 hover:scale-105 hover:shadow-lg"
                    >
                      Tiktok Login
                    </TiktokOAuthSection>
                  </Suspense>
                </div>
                {/* Instagram */}
                <div className="w-40 h-14 pr-2 flex items-center justify-center">
                  <Suspense fallback={<div>Loading Instagram integration...</div>}>
                    <InstagramOAuthSection
                      btnClassName="w-full h-11 flex items-center justify-center text-sm rounded bg-purple from-pink-500 via-red-500 to-yellow-500 text-white font-medium shadow text-base transition-all duration-150 hover:scale-105 hover:shadow-lg"
                    >
                      Instagram Login
                    </InstagramOAuthSection>
                  </Suspense>
                </div>
                {/* Login/Sign Out */}
                <div className="w-40 h-14 flex items-center justify-center">
                  {!isLoggedIn && (
                    <button
                      className="w-full h-11 flex items-center gap-2 justify-center rounded-l bg-[#2ec4b6] text-white font-mediumshadow text-base transition-all duration-150 hover:scale-105 hover:shadow-lg"
                      onClick={() => setShowLogin(true)}
                    >
                      Socialflow Login
                    </button>
                  )}
                  {isLoggedIn && (
                    <button
                      className="w-full h-11 flex items-center gap-2 justify-center rounded-l bg-red-400 text-white font-medium shadow text-base transition-all duration-150 hover:scale-105 hover:shadow-lg"
                      onClick={() => {
                        setUser({ name: "Nama User", email: "user@email.com", photo: "https://ui-avatars.com/api/?name=User&background=56ad9c&color=fff" });
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("currentUser");
                          localStorage.removeItem("profileUser");
                          window.location.href = "/login";
                        }
                      }}
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Performance last month */}
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col gap-4">
            <div className="font-bold text-lg text-[#2ec4b6] mb-2">Performance last month</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Engagement rate</div>
                <div className="text-[#fd3a69] font-bold">Low - 4.88%</div>
              </div>
              <div>
                <div className="text-gray-400">Followers growth</div>
                <div className="text-[#2ec4b6] font-bold">Good - +0.01%</div>
              </div>
              <div>
                <div className="text-gray-400">Post frequency</div>
                <div className="text-[#fd3a69] font-bold">Low - 1/week</div>
              </div>
              <div>
                <div className="text-gray-400">Estimated collaboration price</div>
                <div className="text-gray-400 flex items-center gap-1"><svg width="16" height="16" fill="none" stroke="#bbb" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> <span>Locked</span></div>
              </div>
            </div>
            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2">
              <div className="text-gray-400 text-sm">Videos avg. views</div>
              <div className="font-bold text-lg text-[#2ec4b6]">9.8M</div>
              <button className="ml-auto px-4 py-2 rounded bg-[#eafaf6] text-[#2ec4b6] font-bold text-sm">View full analytics</button>
            </div>
          </div>
          {/* Cards bawah */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2 relative">
              <div className="flex items-center gap-3 mb-2">
                <Image src={user.photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" width={40} height={40} />
                <div>
                  <div className="font-bold text-[#2ec4b6]">{user.name}</div>
                  <div className="text-xs text-gray-400">8.5K • Indonesia</div>
                </div>
                <button className="absolute top-2 right-2 bg-[#f4faf8] rounded-full p-1 shadow" title="Copy link"><svg width="16" height="16" fill="none" stroke="#2ec4b6" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg></button>
              </div>
              <div className="font-semibold text-gray-700 mb-2">Dinur • Social Media Content Strategist</div>
              <button className="px-4 py-2 rounded bg-[#2ec4b6] text-white font-bold text-sm mb-1">Open full report</button>
              <button className="px-4 py-2 rounded bg-[#eafaf6] text-[#2ec4b6] font-bold text-sm">Start tracking</button>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2 relative">
              <div className="flex items-center gap-3 mb-2">
                <Image src={user.photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" width={40} height={40} />
                <div>
                  <div className="font-bold text-[#2ec4b6]">{user.name}</div>
                  <div className="text-xs text-gray-400">8.2K • Indonesia</div>
                </div>
                <button className="absolute top-2 right-2 bg-[#f4faf8] rounded-full p-1 shadow" title="Copy link"><svg width="16" height="16" fill="none" stroke="#2ec4b6" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg></button>
              </div>
              <div className="font-semibold text-gray-700 mb-2">Dinur | Daily Life anak sosmed</div>
              <div className="flex gap-2 mb-2">
                <span className="bg-[#eafaf6] text-[#2ec4b6] px-2 py-0.5 rounded text-xs font-semibold">Comedy</span>
                <span className="bg-[#eafaf6] text-[#2ec4b6] px-2 py-0.5 rounded text-xs font-semibold">Science & Education</span>
              </div>
              <button className="px-4 py-2 rounded bg-[#2ec4b6] text-white font-bold text-sm">Open full report</button>
            </div>
            {/* Card 3 (dummy) */}
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2 relative opacity-60 pointer-events-none">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <div className="font-bold text-gray-400">-</div>
                  <div className="text-xs text-gray-300">-</div>
                </div>
              </div>
              <div className="font-semibold text-gray-400 mb-2">-</div>
              <button className="px-4 py-2 rounded bg-gray-200 text-gray-400 font-bold text-sm mb-1">Open full report</button>
              <button className="px-4 py-2 rounded bg-gray-100 text-gray-300 font-bold text-sm">Start tracking</button>
            </div>
          </div>
        </div>
      </div>
      {/* Pengaturan Akun Modal, Crop Modal, Login Modal, dll tetap ada di bawah */}
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
                    <Image src={editPhoto} alt="Preview" className="w-10 h-10 rounded-lg object-cover" width={40} height={40} />
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

