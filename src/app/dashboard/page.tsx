"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Modal from "react-modal";
import { FaTrophy, FaArrowDown, FaInstagram, FaTiktok } from "./DashboardIcons";
import Image from "next/image";

const Chart = dynamic(() => import("./Chart"), { ssr: false });

function getContentPlanCount(key: string) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const rows = JSON.parse(saved);
        return Array.isArray(rows) ? rows.length : 0;
      } catch {}
    }
  }
  return 0;
}

function getAnalisaData(key: string, type: "er" | "reach" | "views", bulan: number, tahun: number) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const rows = JSON.parse(saved);
        if (Array.isArray(rows)) {
          // Filter by bulan & tahun
          return rows.filter((row: any) => {
            if (!row.tanggal) return false;
            const d = new Date(row.tanggal);
            return d.getMonth() === bulan && d.getFullYear() === tahun;
          });
        }
      } catch {}
    }
  }
  return [];
}

// Tambahkan helper function di atas komponen utama
function getContentTypeByJudulAndViews(judul: string, views: string | number, rows: any[]): string {
  if (!judul || !rows) return '';
  const match = rows.find((row: any) => {
    const rowJudul = row.headline || row.judul || row.caption || row.tanggal;
    return rowJudul === judul && String(row.views) === String(views);
  });
  if (!match) return '';
  return (
    match.jenis ||
    match.type ||
    match.tipe ||
    match.category ||
    match.kategori ||
    ''
  );
}

export default function DashboardPage() {
  // Dummy data akun, bisa diganti dengan data dinamis jika tersedia
  const [akunIG, setAkunIG] = useState({ nama: "Akun Instagram", username: "@akun_ig", followers: 12000, photo: "" });
  const [akunTikTok, setAkunTikTok] = useState({ nama: "Akun TikTok", username: "@akun_tiktok", followers: 8000, photo: "" });
  const [showModal, setShowModal] = useState<{ platform: "ig" | "tiktok" | null }>({ platform: null });
  const [form, setForm] = useState({ username: "", followers: "", photo: "" });

  const [igCount, setIgCount] = useState(0);
  const [tiktokCount, setTiktokCount] = useState(0);
  const [labels, setLabels] = useState<string[]>([]);
  const [igER, setIgER] = useState<number[]>([]);
  const [tiktokER, setTiktokER] = useState<number[]>([]);
  const [igReach, setIgReach] = useState<number>(0);
  const [tiktokViews, setTiktokViews] = useState<number>(0);
  const [totalERIG, setTotalERIG] = useState<number>(0);
  const [totalERTiktok, setTotalERTiktok] = useState<number>(0);
  const [igViewsArr, setIgViewsArr] = useState<number[]>([]);
  const [tiktokViewsArr, setTiktokViewsArr] = useState<number[]>([]);
  const [igInteractionArr, setIgInteractionArr] = useState<number[]>([]);
  const [tiktokInteractionArr, setTiktokInteractionArr] = useState<number[]>([]);
  const [igFollowersPerMonth, setIgFollowersPerMonth] = useState<number[]>([]);
  const [tiktokFollowersPerMonth, setTiktokFollowersPerMonth] = useState<number[]>([]);

  // State untuk ukuran kolom dashboard
  const defaultColWidths = { ig: 160, tiktok: 160, er: 160, views: 160 };
  const [colWidths, setColWidths] = useState<{ [key: string]: number }>(defaultColWidths);

  // State for top/bottom content IG & TikTok
  const [topIGContent, setTopIGContent] = useState<any[]>([]);
  const [bottomIGContent, setBottomIGContent] = useState<any[]>([]);
  const [topTiktokContent, setTopTiktokContent] = useState<any[]>([]);
  const [bottomTiktokContent, setBottomTiktokContent] = useState<any[]>([]);

  // Tambah state untuk rows insight IG
  const [igRowsState, setIgRowsState] = useState<any[]>([]);
  const [tiktokRowsState, setTiktokRowsState] = useState<any[]>([]);

  // Pastikan ukuran dashboard persist dan tidak berubah saat navigasi
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWidths = localStorage.getItem("dashboardColWidths");
      if (savedWidths) {
        try {
          const parsed = JSON.parse(savedWidths);
          if (parsed && typeof parsed === "object") {
            setColWidths((prev) => ({ ...prev, ...parsed }));
          }
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    // Total postingan
    setIgCount(getContentPlanCount("contentPlanRows"));
    setTiktokCount(getContentPlanCount("tiktokContentPlanRows"));

    // Ambil data analisa IG & TikTok bulan ini
    const now = new Date();
    const bulan = now.getMonth();
    const tahun = now.getFullYear();
    const igRows = getAnalisaData("igAnalisaRows", "er", bulan, tahun);
    const tiktokRows = getAnalisaData("tiktokAnalisaRows", "er", bulan, tahun);

    setIgRowsState(igRows);
    // Bottom 5 IG: views valid, urut naik
    const igSortedAsc = [...igRows]
      .filter(row => row.views !== undefined && row.views !== null && row.views !== "")
      .sort((a, b) => (parseInt(a.views || "0", 10) || 0) - (parseInt(b.views || "0", 10) || 0));
    setBottomIGContent(
      igSortedAsc.slice(0, 5).map(row => ({
        judul: row.headline || row.judul || row.caption || row.tanggal || '',
        views: row.views || 0,
        ...row
      }))
    );
    // Top 5 IG: views valid, urut turun
    const igSortedDesc = [...igRows]
      .filter(row => row.views !== undefined && row.views !== null && row.views !== "")
      .sort((a, b) => (parseInt(b.views || "0", 10) || 0) - (parseInt(a.views || "0", 10) || 0));
    setTopIGContent(
      igSortedDesc.slice(0, 5).map(row => ({
        judul: row.headline || row.judul || row.caption || row.tanggal || '',
        views: row.views || 0,
        ...row
      }))
    );
    // Bottom 5 TikTok: views valid, urut naik
    const tiktokSortedAsc = [...tiktokRows]
      .filter(row => row.views !== undefined && row.views !== null && row.views !== "")
      .sort((a, b) => (parseInt(a.views || "0", 10) || 0) - (parseInt(b.views || "0", 10) || 0));
    setBottomTiktokContent(
      tiktokSortedAsc.slice(0, 5).map(row => ({
        judul: row.headline || row.judul || row.caption || row.tanggal || '',
        views: row.views || 0,
        ...row
      }))
    );
    // Top 5 TikTok: views valid, urut turun
    const tiktokSortedDesc = [...tiktokRows]
      .filter(row => row.views !== undefined && row.views !== null && row.views !== "")
      .sort((a, b) => (parseInt(b.views || "0", 10) || 0) - (parseInt(a.views || "0", 10) || 0));
    setTopTiktokContent(
      tiktokSortedDesc.slice(0, 5).map(row => ({
        judul: row.headline || row.judul || row.caption || row.tanggal || '',
        views: row.views || 0,
        ...row
      }))
    );
    // Labels: tanggal unik
    const allDates = Array.from(new Set([
      ...igRows.map((r: any) => r.tanggal),
      ...tiktokRows.map((r: any) => r.tanggal),
    ])).sort();
    setLabels(allDates);

    // ER IG
    setIgER(
      allDates.map(date => {
        const row = igRows.find((r: any) => r.tanggal === date);
        if (!row) return 0;
        const like = parseInt(row.like || "0", 10);
        const comment = parseInt(row.comment || "0", 10);
        const share = parseInt(row.share || "0", 10);
        const save = parseInt(row.save || "0", 10);
        const reach = parseInt(row.reach || "0", 10);
        if (!reach || isNaN(reach)) return 0;
        return ((like + comment + share + save) / reach) * 100;
      })
    );
    // Total ER IG bulan ini
    const erIGArr = igRows.map((row: any) => {
      const like = parseInt(row.like || "0", 10);
      const comment = parseInt(row.comment || "0", 10);
      const share = parseInt(row.share || "0", 10);
      const save = parseInt(row.save || "0", 10);
      const reach = parseInt(row.reach || "0", 10);
      if (!reach || isNaN(reach)) return 0;
      return ((like + comment + share + save) / reach) * 100;
    });
    setTotalERIG(erIGArr.length ? (erIGArr.reduce((a, b) => a + b, 0) / erIGArr.length) : 0);
    // ER TikTok
    setTiktokER(
      allDates.map(date => {
        const row = tiktokRows.find((r: any) => r.tanggal === date);
        if (!row) return 0;
        const like = parseInt(row.like || "0", 10);
        const comment = parseInt(row.comment || "0", 10);
        const share = parseInt(row.share || "0", 10);
        const save = parseInt(row.save || "0", 10);
        const views = parseInt(row.views || "0", 10);
        if (!views || isNaN(views)) return 0;
        return ((like + comment + share + save) / views) * 100;
      })
    );
    // Total ER TikTok bulan ini
    const erTikTokArr = tiktokRows.map((row: any) => {
      const like = parseInt(row.like || "0", 10);
      const comment = parseInt(row.comment || "0", 10);
      const share = parseInt(row.share || "0", 10);
      const save = parseInt(row.save || "0", 10);
      const views = parseInt(row.views || "0", 10);
      if (!views || isNaN(views)) return 0;
      return ((like + comment + share + save) / views) * 100;
    });
    setTotalERTiktok(erTikTokArr.length ? (erTikTokArr.reduce((a, b) => a + b, 0) / erTikTokArr.length) : 0);
    // Pencapaian Reach IG bulan ini
    setIgReach(
      igRows.reduce((acc: number, row: any) => acc + (parseInt(row.reach || "0", 10) || 0), 0)
    );
    // Pencapaian Views TikTok bulan ini
    setTiktokViews(
      tiktokRows.reduce((acc: number, row: any) => acc + (parseInt(row.views || "0", 10) || 0), 0)
    );
    // Ambil data views IG & TikTok per tanggal
    setIgViewsArr(
      allDates.map(date => {
        const row = igRows.find((r: any) => r.tanggal === date);
        if (!row) return 0;
        return parseInt(row.views || "0", 10) || 0;
      })
    );
    setTiktokViewsArr(
      allDates.map(date => {
        const row = tiktokRows.find((r: any) => r.tanggal === date);
        if (!row) return 0;
        return parseInt(row.views || "0", 10) || 0;
      })
    );
    // Ambil data interaction IG & TikTok per tanggal
    setIgInteractionArr(
      allDates.map(date => {
        const row = igRows.find((r: any) => r.tanggal === date);
        if (!row) return 0;
        const like = parseInt(row.like || "0", 10);
        const comment = parseInt(row.comment || "0", 10);
        const share = parseInt(row.share || "0", 10);
        const save = parseInt(row.save || "0", 10);
        return like + comment + share + save;
      })
    );
    setTiktokInteractionArr(
      allDates.map(date => {
        const row = tiktokRows.find((r: any) => r.tanggal === date);
        if (!row) return 0;
        const like = parseInt(row.like || "0", 10);
        const comment = parseInt(row.comment || "0", 10);
        const share = parseInt(row.share || "0", 10);
        const save = parseInt(row.save || "0", 10);
        return like + comment + share + save;
      })
    );
    // Followers per bulan dari KPI Target (Tercapai)
    const kpiTargetRaw = localStorage.getItem("kpiTargetRows" + tahun);
    let kpiRows = [];
    if (kpiTargetRaw) {
      try {
        kpiRows = JSON.parse(kpiTargetRaw);
      } catch {}
    }
    setIgFollowersPerMonth(
      kpiRows.map((row: any) => parseInt(row.ig?.achievedFollowers || "0", 10) || 0)
    );
    setTiktokFollowersPerMonth(
      kpiRows.map((row: any) => parseInt(row.tiktok?.achievedFollowers || "0", 10) || 0)
    );
    // Load akun IG/TikTok dari localStorage
    if (typeof window !== "undefined") {
      const ig = localStorage.getItem("akunIG");
      if (ig) setAkunIG(JSON.parse(ig));
      const tiktok = localStorage.getItem("akunTikTok");
      if (tiktok) setAkunTikTok(JSON.parse(tiktok));
    }
  }, []);

  // Handler drag-resize kolom dashboard
  function handleColResize(key: string, newWidth: number) {
    const updated = { ...colWidths, [key]: Math.max(newWidth, 80) };
    setColWidths(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardColWidths", JSON.stringify(updated));
    }
  }

  function openModal(platform: "ig" | "tiktok") {
    setShowModal({ platform });
    if (platform === "ig") {
      setForm({ username: akunIG.username, followers: akunIG.followers.toString(), photo: akunIG.photo || "" });
    } else {
      setForm({ username: akunTikTok.username, followers: akunTikTok.followers.toString(), photo: akunTikTok.photo || "" });
    }
  }

  function closeModal() {
    setShowModal({ platform: null });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        setForm({ ...form, photo: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handlePhotoButtonClick() {
    fileInputRef.current?.click();
  }

  function handleRemovePhoto() {
    setForm({ ...form, photo: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSave() {
    if (showModal.platform === "ig") {
      const data = { nama: "Akun Instagram", username: form.username, followers: parseInt(form.followers, 10) || 0, photo: form.photo };
      setAkunIG(data);
      if (typeof window !== "undefined") localStorage.setItem("akunIG", JSON.stringify(data));
    } else if (showModal.platform === "tiktok") {
      const data = { nama: "Akun TikTok", username: form.username, followers: parseInt(form.followers, 10) || 0, photo: form.photo };
      setAkunTikTok(data);
      if (typeof window !== "undefined") localStorage.setItem("akunTikTok", JSON.stringify(data));
    }
    closeModal();
  }

  // Helper untuk cek apakah data sudah diinput
  function isAkunFilled(akun: { username: string; followers: number; photo: string }) {
    return akun.username && akun.followers > 0;
  }

  // Detect sidebar state
  const [sidebarHidden, setSidebarHidden] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handler = () => {
        setSidebarHidden(document.body.classList.contains('sidebar-hidden'));
      };
      handler();
      window.addEventListener('resize', handler);
      const observer = new MutationObserver(handler);
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => {
        window.removeEventListener('resize', handler);
        observer.disconnect();
      };
    }
  }, []);

  // Format labels to 'D MMM' (e.g., '1 Jun')
  const formattedLabels = labels.map(dateStr => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = d.toLocaleString('id-ID', { month: 'short' });
    return `${day} ${month}`;
  });

  // Tambahkan state untuk filter chart per grafik
  const [chartFilterER, setChartFilterER] = useState<'all' | 'ig' | 'tiktok'>('all');
  const [chartFilterViews, setChartFilterViews] = useState<'all' | 'ig' | 'tiktok'>('all');
  const [chartFilterInteraksi, setChartFilterInteraksi] = useState<'all' | 'ig' | 'tiktok'>('all');
  const [chartFilterFollowers, setChartFilterFollowers] = useState<'all' | 'ig' | 'tiktok'>('all');

  // Tambahkan state untuk TikTok API
  const [tiktokApiData, setTiktokApiData] = useState<any>(null);
  const [tiktokApiLoading, setTiktokApiLoading] = useState(false);
  const [tiktokApiError, setTiktokApiError] = useState<string | null>(null);

  // Ambil access_token TikTok dari localStorage
  const [tiktokAccessToken, setTiktokAccessToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tiktok_access_token');
      if (token) setTiktokAccessToken(token);
    }
  }, []);

  useEffect(() => {
    if (!tiktokAccessToken) return;
    setTiktokApiLoading(true);
    fetch(`/api/tiktok-analytics?access_token=${tiktokAccessToken}`)
      .then(res => res.json())
      .then(data => {
        setTiktokApiData(data);
        setTiktokApiLoading(false);
      })
      .catch(err => {
        setTiktokApiError("Gagal fetch data TikTok API");
        setTiktokApiLoading(false);
      });
  }, [tiktokAccessToken]);

  // Tambahkan state untuk Instagram API
  const [instagramApiData, setInstagramApiData] = useState<any>(null);
  const [instagramApiLoading, setInstagramApiLoading] = useState(false);
  const [instagramApiError, setInstagramApiError] = useState<string | null>(null);
  const [instagramAccessToken, setInstagramAccessToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('instagram_access_token');
      if (token) {
        fetch(`/api/instagram-analytics?access_token=${token}`)
          .then(res => res.json())
          .then(data => {
            localStorage.setItem('instagram_insight_data', JSON.stringify(data));
          });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('instagram_insight_data');
      if (cached) {
        try {
          setInstagramApiData(JSON.parse(cached));
        } catch {}
      }
    }
  }, []);

  return (
    <div
      className="space-y-8"
      style={{
        // Pastikan lebar dashboard tidak terpengaruh layout global
        maxWidth: "100%",
        width: "100%",
        marginLeft: sidebarHidden ? 0 : undefined,
        transition: "margin-left 0.3s, width 0.3s"
      }}
    >
      <h1 className="text-3xl font-bold mb-4 text-[#56ad9c]">Reporting Dashboard</h1>
      {/* Tambahkan info TikTok API */}
      <div className="mb-4">
        {tiktokApiLoading && <div className="text-sm text-gray-500">Memuat data TikTok API...</div>}
        {tiktokApiError && <div className="text-sm text-red-500">{tiktokApiError}</div>}
        {tiktokApiData && (
          <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto max-h-40">{JSON.stringify(tiktokApiData, null, 2)}</pre>
        )}
      </div>
      {/* Tambahkan info Instagram API */}
      <div className="mb-4">
        {instagramApiLoading && <div className="text-sm text-gray-500">Memuat data Instagram API...</div>}
        {instagramApiError && <div className="text-sm text-red-500">{instagramApiError}</div>}
        {instagramApiData && (
          <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto max-h-40">{JSON.stringify(instagramApiData, null, 2)}</pre>
        )}
      </div>
      {/* Header akun */}
      <div className="flex flex-col md:flex-row gap-6 mb-4">
        {/* IG Card + ER IG */}
        <div className="flex flex-1 gap-4">
          <div className="bg-white rounded-lg shadow p-4 flex-1 relative flex items-center gap-4" style={{ minWidth: colWidths.ig }}>
            {akunIG.photo && (
              <Image src={akunIG.photo} alt="IG Profile" className="w-16 h-16 rounded-lg object-cover" width={64} height={64} />
            )}
            <div className="flex-1">
              <div className="text-lg font-bold text-[#56ad9c]">{akunIG.nama}</div>
              <div className="text-sm text-gray-400">Username: <span className="font-semibold text-[#56ad9c]">{akunIG.username || "Belum diisi"}</span></div>
              <div className="text-sm text-gray-400">Followers: <span className="font-semibold text-[#56ad9c]">{akunIG.followers > 0 ? akunIG.followers.toLocaleString('id-ID') : "Belum diisi"}</span></div>
            </div>
            <button className="absolute top-2 right-2 bg-[#56ad9c] text-white px-2 py-1 rounded text-xs" onClick={() => openModal("ig")}>Edit Akun</button>
            {/* Drag bar IG */}
            <div
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-10"
              onMouseDown={e => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = colWidths.ig;
                function onMouseMove(ev: MouseEvent) {
                  handleColResize("ig", startWidth + (ev.clientX - startX));
                }
                function onMouseUp() {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                }
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            />
          </div>
          <div className="dashboard-er-card shadow p-4 flex flex-col justify-center items-center relative" style={{ minWidth: colWidths.er }}>
            <div className="text-sm text-gray-400 mb-1 text-center">Instagram ER%</div>
            <div className="text-3xl font-extrabold text-[#56ad9c] text-center">{totalERIG.toFixed(2)}%</div>
            {/* Drag bar ER IG */}
            <div
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-10"
              onMouseDown={e => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = colWidths.er || 160;
                function onMouseMove(ev: MouseEvent) {
                  handleColResize("er", startWidth + (ev.clientX - startX));
                }
                function onMouseUp() {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                }
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            />
          </div>
        </div>
        {/* TikTok Card + ER TikTok */}
        <div className="flex flex-1 gap-4">
          <div className="bg-white rounded-lg shadow p-4 flex-1 relative flex items-center gap-4" style={{ minWidth: colWidths.tiktok }}>
            {akunTikTok.photo && (
              <Image src={akunTikTok.photo} alt="TikTok Profile" className="w-16 h-16 rounded-lg object-cover" width={64} height={64} />
            )}
            <div className="flex-1">
              <div className="text-lg font-bold text-[#56ad9c]">{akunTikTok.nama}</div>
              <div className="text-sm text-gray-400">Username: <span className="font-semibold text-[#56ad9c]">{akunTikTok.username || "Belum diisi"}</span></div>
              <div className="text-sm text-gray-400">Followers: <span className="font-semibold text-[#56ad9c]">{akunTikTok.followers > 0 ? akunTikTok.followers.toLocaleString('id-ID') : "Belum diisi"}</span></div>
            </div>
            <button className="absolute top-2 right-2 bg-[#56ad9c] text-white px-2 py-1 rounded text-xs" onClick={() => openModal("tiktok")}>Edit Akun</button>
            {/* Drag bar TikTok */}
            <div
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-10"
              onMouseDown={e => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = colWidths.tiktok;
                function onMouseMove(ev: MouseEvent) {
                  handleColResize("tiktok", startWidth + (ev.clientX - startX));
                }
                function onMouseUp() {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                }
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            />
          </div>
          <div className="dashboard-er-card shadow p-4 flex flex-col justify-center items-center relative" style={{ minWidth: colWidths.views }}>
            <div className="text-sm text-gray-400 mb-1 text-center">Tiktok ER%</div>
            <div className="text-3xl font-extrabold text-[#56ad9c] text-center">{totalERTiktok.toFixed(2)}%</div>
            {/* Drag bar ER TikTok */}
            <div
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize z-10"
              onMouseDown={e => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = colWidths.views || 160;
                function onMouseMove(ev: MouseEvent) {
                  handleColResize("views", startWidth + (ev.clientX - startX));
                }
                function onMouseUp() {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                }
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            />
          </div>
        </div>
      </div>
      <section className="bg-gradient-to-r from-[#56ad9c]/10 to-[#56ad9c]/40 rounded-lg shadow p-6">
        {/* Card summary dipindah ke atas card top content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-[#56ad9c]">{igCount.toLocaleString('id-ID')}</div>
            <div className="text-[#56ad9c]">Total Postingan Instagram</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-[#56ad9c]">{tiktokCount.toLocaleString('id-ID')}</div>
            <div className="text-[#56ad9c]">Total Postingan TikTok</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-[#56ad9c]">{igReach.toLocaleString('id-ID')}</div>
            <div className="text-[#56ad9c]">Pencapaian Reach IG Bulan Ini</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-[#56ad9c]">{tiktokViews.toLocaleString('id-ID')}</div>
            <div className="text-[#56ad9c]">Pencapaian Views TikTok Bulan Ini</div>
          </div>
        </div>
        {/* Top & Bottom Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FaInstagram className="text-2xl text-[#56ad9c]" />
              <span className="font-bold tracking-widest text-gray-700 text-lg">INSTAGRAM</span>
            </div>
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FaTrophy className="text-[#56ad9c] text-lg" />
                <span className="font-semibold text-gray-700">5 Best Content Based on Views</span>
                <span className="ml-auto bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded">AUTO</span>
              </div>
              <div className="text-xs text-gray-400 mb-1">in {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</div>
              <div className="text-xs text-gray-500 mb-1">Top 1 Content Based on View</div>
              <div className="text-2xl font-bold text-[#56ad9c] mb-1">{topIGContent[0]?.judul || topIGContent[0]?.caption || topIGContent[0]?.tanggal || '#N/A'}</div>
              <div className="flex gap-4 text-xs text-gray-500 mb-1">
                <span>Total Views <span className="font-bold text-[#56ad9c]">{(topIGContent[0]?.views ?? 0).toLocaleString('id-ID')}</span></span>
              </div>
            </div>
            <div className="w-full">
              <div className="flex font-semibold bg-[#56ad9c]/10 rounded-t px-2 py-1 text-[#56ad9c]">
                <div className="flex-1">Judul Content</div>
                <div className="w-24 text-right">Total Views</div>
              </div>
              <div className="divide-y divide-dashed divide-[#56ad9c]/30 bg-white rounded-b">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="flex px-2 py-1 text-sm">
                    <div className="flex-1 truncate">{topIGContent[i]?.judul || topIGContent[i]?.caption || topIGContent[i]?.tanggal || '#N/A'}</div>
                    <div className="w-24 text-right">{typeof topIGContent[i]?.views === 'number' ? topIGContent[i]?.views.toLocaleString('id-ID') : (parseInt(topIGContent[i]?.views || '0', 10)).toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FaTiktok className="text-2xl text-[#56ad9c]" />
              <span className="font-bold tracking-widest text-gray-700 text-lg">TIKTOK</span>
            </div>
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FaTrophy className="text-[#56ad9c] text-lg" />
                <span className="font-semibold text-gray-700">5 Best Content Based on Views</span>
                <span className="ml-auto bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded">AUTO</span>
              </div>
              <div className="text-xs text-gray-400 mb-1">in {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</div>
              <div className="text-xs text-gray-500 mb-1">Top 1 Content based on View</div>
              <div className="text-2xl font-bold text-[#56ad9c] mb-1">{topTiktokContent[0]?.judul || topTiktokContent[0]?.caption || topTiktokContent[0]?.tanggal || '#N/A'}</div>
              <div className="flex gap-4 text-xs text-gray-500 mb-1">
                <span>Total Views <span className="font-bold text-[#56ad9c]">{(topTiktokContent[0]?.views ?? 0).toLocaleString('id-ID')}</span></span>
              </div>
            </div>
            <div className="w-full">
              <div className="flex font-semibold bg-[#56ad9c]/10 rounded-t px-2 py-1 text-[#56ad9c]">
                <div className="flex-1">Judul Content</div>
                <div className="w-24 text-right">Total Views</div>
              </div>
              <div className="divide-y divide-dashed divide-[#56ad9c]/30 bg-white rounded-b">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="flex px-2 py-1 text-sm">
                    <div className="flex-1 truncate">{topTiktokContent[i]?.judul || topTiktokContent[i]?.caption || topTiktokContent[i]?.tanggal || '#N/A'}</div>
                    <div className="w-24 text-right">{typeof topTiktokContent[i]?.views === 'number' ? topTiktokContent[i]?.views.toLocaleString('id-ID') : (parseInt(topTiktokContent[i]?.views || '0', 10)).toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Instagram Bottom 5 Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
  <FaInstagram className="text-2xl text-red-500" />
  <span className="font-bold tracking-widest text-gray-700 text-lg">INSTAGRAM</span>
</div>
<div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
  <div className="flex items-center gap-2 mb-1">
    <FaArrowDown className="text-red-500 text-lg" />
    <span className="font-semibold text-gray-700">5 Bottom Content Based on Views</span>
  </div>
  <div className="text-xs text-gray-400 mb-1">in {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</div>
  <div className="text-xs text-gray-500 mb-1">Bottom 1 Content Based on View</div>
  <div className="text-2xl font-bold text-red-500 mb-1">{bottomIGContent[0]?.judul || bottomIGContent[0]?.caption || bottomIGContent[0]?.tanggal || '#N/A'}</div>
  <div className="flex gap-4 text-xs text-gray-500 mb-1">
    <span>Total Views <span className="font-bold text-red-500">{(bottomIGContent[0]?.views ?? 0).toLocaleString('id-ID')}</span></span>
  </div>
</div>
<div className="w-full">
  <div className="flex font-semibold bg-red-100/40 rounded-t px-2 py-1 text-red-500">
    <div className="flex-1">Judul Content</div>
    <div className="w-24 text-right">Total Views</div>
  </div>
  <div className="divide-y divide-dashed divide-red-300/60 bg-white rounded-b">
    {[0,1,2,3,4].map(i => (
      <div key={i} className="flex px-2 py-1 text-sm">
        <div className="flex-1 truncate">{bottomIGContent[i]?.judul || '#N/A'}</div>
        <div className="w-24 text-right">{typeof bottomIGContent[i]?.views === 'number' ? bottomIGContent[i]?.views.toLocaleString('id-ID') : (parseInt(bottomIGContent[i]?.views || '0', 10)).toLocaleString('id-ID')}</div>
      </div>
    ))}
  </div>
</div>
          </div>
          {/* TikTok Bottom 5 Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FaTiktok className="text-2xl text-red-500" />
              <span className="font-bold tracking-widest text-gray-700 text-lg">TIKTOK</span>
            </div>
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FaArrowDown className="text-red-500 text-lg" />
                <span className="font-semibold text-gray-700">5 Bottom Content Based on Views</span>
              </div>
              <div className="text-xs text-gray-400 mb-1">in {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</div>
              <div className="text-xs text-gray-500 mb-1">Bottom 1 Content based on View</div>
              <div className="text-2xl font-bold text-red-500 mb-1">{bottomTiktokContent[0]?.judul || bottomTiktokContent[0]?.caption || bottomTiktokContent[0]?.tanggal || '#N/A'}</div>
              <div className="flex gap-4 text-xs text-gray-500 mb-1">
                <span>Total Views <span className="font-bold text-red-500">{bottomTiktokContent[0]?.views || '#N/A'}</span></span>
              </div>
            </div>
            <div className="w-full">
              <div className="flex font-semibold bg-red-100/40 rounded-t px-2 py-1 text-red-500">
                <div className="flex-1">Judul Content</div>
                <div className="w-24 text-right">Total Views</div>
              </div>
              <div className="divide-y divide-dashed divide-red-300/60 bg-white rounded-b">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="flex px-2 py-1 text-sm">
                    <div className="flex-1 truncate">{bottomTiktokContent[i]?.judul || '#N/A'}</div>
                    <div className="w-24 text-right">{typeof bottomTiktokContent[i]?.views === 'number' ? bottomTiktokContent[i]?.views.toLocaleString('id-ID') : (parseInt(bottomTiktokContent[i]?.views || '0', 10)).toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-r from-[#56ad9c]/10 to-[#56ad9c]/40 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            {/* Dropdown filter untuk ER */}
            <div className="flex justify-end mb-2">
              <select
                className="border px-2 py-1 rounded text-xs text-[#56ad9c] font-semibold"
                value={chartFilterER}
                onChange={e => setChartFilterER(e.target.value as 'all' | 'ig' | 'tiktok')}
              >
                <option value="all">IG & TikTok</option>
                <option value="ig">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div className="text-lg font-bold text-[#56ad9c] mb-2 text-center">Engagement Rate Instagram & TikTok</div>
            <Chart
              labels={formattedLabels}
              igData={chartFilterER === 'tiktok' ? [] : igER}
              tiktokData={chartFilterER === 'ig' ? [] : tiktokER}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            {/* Dropdown filter untuk Views */}
            <div className="flex justify-end mb-2">
              <select
                className="border px-2 py-1 rounded text-xs text-[#56ad9c] font-semibold"
                value={chartFilterViews}
                onChange={e => setChartFilterViews(e.target.value as 'all' | 'ig' | 'tiktok')}
              >
                <option value="all">IG & TikTok</option>
                <option value="ig">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div className="text-lg font-bold text-[#56ad9c] mb-2 text-center">Total Views Instagram & TikTok</div>
            <Chart
              labels={formattedLabels}
              igData={chartFilterViews === 'tiktok' ? [] : igViewsArr}
              tiktokData={chartFilterViews === 'ig' ? [] : tiktokViewsArr}
              title="Grafik views per hari"
              igLabel="Views Instagram"
              tiktokLabel="Views Tiktok"
              yLabel=""
            />
          </div>
        </div>
        {/* Grafik Interaksi Harian & Followers per Bulan dalam 1 baris kecil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            {/* Dropdown filter untuk Interaksi */}
            <div className="flex justify-end mb-2">
              <select
                className="border px-2 py-1 rounded text-xs text-[#56ad9c] font-semibold"
                value={chartFilterInteraksi}
                onChange={e => setChartFilterInteraksi(e.target.value as 'all' | 'ig' | 'tiktok')}
              >
                <option value="all">IG & TikTok</option>
                <option value="ig">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div className="text-lg font-bold text-[#56ad9c] mb-2 text-center">Total Interaksi Harian Instagram & TikTok</div>
            <Chart
              labels={formattedLabels}
              igData={chartFilterInteraksi === 'tiktok' ? [] : igInteractionArr}
              tiktokData={chartFilterInteraksi === 'ig' ? [] : tiktokInteractionArr}
              title="Grafik Interaksi per Hari"
              igLabel="Interaksi IG"
              tiktokLabel="Interaksi TikTok"
              yLabel=""
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            {/* Dropdown filter untuk Followers */}
            <div className="flex justify-end mb-2">
              <select
                className="border px-2 py-1 rounded text-xs text-[#56ad9c] font-semibold"
                value={chartFilterFollowers}
                onChange={e => setChartFilterFollowers(e.target.value as 'all' | 'ig' | 'tiktok')}
              >
                <option value="all">IG & TikTok</option>
                <option value="ig">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div className="text-lg font-bold text-[#56ad9c] mb-2 text-center">Followers Tercapai per Bulan</div>
            <Chart
              labels={["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]}
              igData={chartFilterFollowers === 'tiktok' ? [] : igFollowersPerMonth}
              tiktokData={chartFilterFollowers === 'ig' ? [] : tiktokFollowersPerMonth}
              title="Grafik Followers Tercapai per Bulan"
              igLabel="Followers IG"
              tiktokLabel="Followers TikTok"
              yLabel=""
            />
          </div>
        </div>
      </section>
      <Modal
        isOpen={!!showModal.platform}
        onRequestClose={closeModal}
        className="bg-white rounded-lg shadow p-6 max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        ariaHideApp={false}
      >
        <h2 className="text-xl font-bold mb-4 text-[#56ad9c]">Edit Akun {showModal.platform === 'ig' ? 'Instagram' : 'TikTok'}</h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Username</label>
          <input name="username" value={form.username} onChange={handleChange} className={`border rounded px-2 py-1 w-full ${form.username ? 'text-black' : 'text-gray-400'}`} />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Followers</label>
          <input name="followers" type="number" value={form.followers} onChange={handleChange} className={`border rounded px-2 py-1 w-full ${form.followers ? 'text-black' : 'text-gray-400'}`} />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Foto Profil</label>
          <div className="flex gap-2 items-center">
            <button type="button" className="bg-[#56ad9c] text-white px-2 py-1 rounded text-xs" onClick={handlePhotoButtonClick}>Upload Foto</button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
            {form.photo && (
              <>
                <Image src={form.photo} alt="Preview" className="w-10 h-10 rounded-lg object-cover" width={40} height={40} />
                <button type="button" className="text-xs text-red-500" onClick={handleRemovePhoto}>Hapus</button>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button type="button" className="px-4 py-2 rounded bg-red-500 text-white" onClick={closeModal}>Batal</button>
          <button type="button" className="px-4 py-2 rounded bg-[#56ad9c] text-white font-bold" onClick={handleSave}>Simpan</button>
        </div>
      </Modal>
    </div>
  );
}
