"use client";

import React, { useState, useEffect } from "react";
// import LoginPage from "./LoginPage"; // Pastikan path ini sesuai dengan lokasi LoginPage Anda
import LoginPage from "../login/page"; // Update path sesuai lokasi LoginPage Anda

interface AnalisaRow {
  tanggal: string;
  headline: string;
  jenis: string;
  reach: string;
  views: string;
  like: string;
  comment: string;
  share: string;
  save: string;
  er: string;
}

const initialRow: AnalisaRow = {
  tanggal: "",
  headline: "",
  jenis: "",
  reach: "",
  views: "",
  like: "",
  comment: "",
  share: "",
  save: "",
  er: "",
};

const JENIS_KONTEN_OPTIONS = [
  { value: "Carousel Photo", label: "Carousel Photo" },
  { value: "Single Photo", label: "Single Photo" },
  { value: "Reels", label: "Reels" },
  { value: "Video", label: "Video" },
  { value: "Story", label: "Story" },
  { value: "Lainnya", label: "Lainnya" },
];

export default function InstagramAnalisaPage() {
  // State untuk dropdown platform
  const [platform, setPlatform] = useState<string>("Instagram");
  // State untuk dropdown bulan
  const bulanList = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const now = new Date();
  const [bulan, setBulan] = useState<number>(now.getMonth());
  const [tahun, setTahun] = useState<number>(now.getFullYear());

  // Navigasi saat platform berubah
  useEffect(() => {
    if (platform === "TikTok") {
      window.location.href = "/tiktok-analisa";
    }
    // Jika Instagram, tetap di halaman ini
  }, [platform]);

  // Ambil data content plan IG dari localStorage
  const getPostedContentPlanRows = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(
        platform === "Instagram" ? "contentPlanRows" : "tiktokContentPlanRows"
      );
      if (saved) {
        try {
          const allRows = JSON.parse(saved);
          if (Array.isArray(allRows)) {
            // Filter hanya yang status "Posted!"
            return allRows.filter((row: any) => row.status === "Posted!")
              .map((row: any) => ({
                tanggal: row.tanggal || "",
                headline: row.headline || "",
                jenis: row.jenis || "",
              }));
          }
        } catch {}
      }
    }
    return [];
  };

  // Gabungkan data analitik user dengan data content plan (berdasarkan tanggal+headline+jenis)
  const mergeRows = (planRows: any[], analyticRows: AnalisaRow[]) => {
    return planRows.map(plan => {
      const found = analyticRows.find(
        a => a.tanggal === plan.tanggal && a.headline === plan.headline && a.jenis === plan.jenis
      );
      return {
        tanggal: plan.tanggal,
        headline: plan.headline,
        jenis: plan.jenis,
        reach: found?.reach || "",
        views: found?.views || "",
        like: found?.like || "",
        comment: found?.comment || "",
        share: found?.share || "",
        save: found?.save || "",
        er: found?.er || "",
      };
    });
  };

  // State utama hanya rows, persist pakai igAnalisaRows
  const [rows, setRows] = useState<AnalisaRow[]>(() => {
    // 1. Cek localStorage igAnalisaRows lebih dulu
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("igAnalisaRows");
      if (saved) {
        // Merge dengan content plan agar baris baru tetap muncul
        const analyticRows = JSON.parse(saved);
        const planRows = getPostedContentPlanRows();
        if (planRows.length > 0) return mergeRows(planRows, analyticRows);
        return analyticRows;
      }
    }
    // 2. Jika belum ada, ambil dari content plan IG yang sudah Posted!
    const postedRows = getPostedContentPlanRows();
    if (postedRows.length > 0) return postedRows.map(plan => ({ ...plan, reach: "", views: "", like: "", comment: "", share: "", save: "", er: "" }));
    // 3. Jika tidak ada juga, pakai initialRow
    return [initialRow];
  });

  // Update rows setiap platform berubah
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Simpan data analitik IG sebelum pindah platform
      if (platform === "TikTok") {
        localStorage.setItem("igAnalisaRows", JSON.stringify(rows));
        window.location.href = "/tiktok-analisa";
      }
      // Jika Instagram, tetap di halaman ini
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  // Kolom: tanggal, headline, jenis, reach, views, like, comment, share, save, er
  const [colWidths, setColWidths] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("igAnalisaColWidths");
      if (saved) return JSON.parse(saved);
    }
    return [120, 180, 140, 90, 90, 90, 90, 90, 90, 90];
  });
  const resizingCol = React.useRef<number | null>(null);
  const startX = React.useRef<number>(0);
  const startWidth = React.useRef<number>(0);
  const handleMouseDown = (idx: number, e: React.MouseEvent) => {
    resizingCol.current = idx;
    startX.current = e.clientX;
    startWidth.current = colWidths[idx];
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (resizingCol.current !== null) {
      const diff = e.clientX - startX.current;
      setColWidths(widths => {
        const newWidths = [...widths];
        newWidths[resizingCol.current!] = Math.max(60, startWidth.current + diff);
        return newWidths;
      });
    }
  };
  const handleMouseUp = () => {
    resizingCol.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("igAnalisaRows", JSON.stringify(rows));
      localStorage.setItem("igAnalisaColWidths", JSON.stringify(colWidths));
    }
  }, [rows, colWidths]);

  // Kolom Reach, Views, Like, Comment, Share, Save sudah bisa diisi manual
  // Pastikan data yang diubah pada input juga update ke state rows
  const handleAnalisaChange = (idx: number, field: keyof AnalisaRow, value: string) => {
    setRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const addRow = () => setRows([...rows, initialRow]);
  const deleteAllRows = () => {
    setRows([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("igAnalisaRows");
    }
  };

  // Helper untuk format tanggal
  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return "";
    const hari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dayName = hari[d.getDay()];
    const day = d.getDate();
    const month = bulan[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Helper untuk menghitung Engagement Rate (ER)
  const calculateER = (row: any) => {
    const like = parseInt(row.like || '0', 10);
    const comment = parseInt(row.comment || '0', 10);
    const share = parseInt(row.share || '0', 10);
    const save = parseInt(row.save || '0', 10);
    const reach = parseInt(row.reach || '0', 10);
    if (!reach || isNaN(reach)) return '';
    const er = ((like + comment + share + save) / reach) * 100;
    return isNaN(er) ? '' : er.toFixed(2) + ' %';
  };

  // Data yang ditampilkan di tabel difilter berdasarkan bulan & tahun dari tanggal posting
  const filteredRows = rows.filter(row => {
    if (!row.tanggal) return false;
    const d = new Date(row.tanggal);
    return d.getMonth() === bulan && d.getFullYear() === tahun;
  });

  // Helper untuk mendapatkan index asli di rows
  const getRowIndex = (row: AnalisaRow) =>
    rows.findIndex(r => r.tanggal === row.tanggal && r.headline === row.headline && r.jenis === row.jenis);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-4 text-[#56ad9c]">Instagram Content Insight</h1>
      <section className="bg-gradient-to-r from-[#56ad9c]/10 to-[#56ad9c]/40 rounded-lg shadow p-6">
        {/* Dropdown Pilihan Instagram/TikTok dan Bulan */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="platform-select" className="mr-2 text-sm font-medium text-[#56ad9c]">Pilih Platform:</label>
            <select
              id="platform-select"
              className="px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#56ad9c] bg-white text-[#56ad9c]"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
            >
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>
          <div className="flex items-center">
            <label htmlFor="bulan-select" className="mr-2 text-sm font-medium text-[#56ad9c]">Bulan:</label>
            <select
              id="bulan-select"
              className="px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#56ad9c] bg-white text-[#56ad9c]"
              value={bulan}
              onChange={e => setBulan(Number(e.target.value))}
            >
              {bulanList.map((b, idx) => (
                <option key={b} value={idx}>{b}</option>
              ))}
            </select>
            <span className="ml-2 text-sm text-[#56ad9c]">{tahun}</span>
          </div>
        </div>
        <div className="relative mt-2 w-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 pb-2">
            <table className="table-auto w-max min-w-full bg-white rounded-lg text-sm border border-gray-300" style={{ fontSize: 13 }}>
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={i} style={{ width: w }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-[#56ad9c] text-white select-none text-sm border-b border-gray-300" style={{ fontSize: 13 }}>
                  {[
                    "Tanggal Posting","Headline Content","Jenis Content","Reach","Views","Like","Comment","Share","Save","ER"
                  ].map((col, idx) => (
                    <th
                      key={col}
                      className={`px-4 py-2 min-w-[60px] text-center relative group text-sm border-r border-gray-200 last:border-r-0`}
                      style={{ position: 'relative', fontSize: 13 }}
                    >
                      {col}
                      <span
                        onMouseDown={e => handleMouseDown(idx, e)}
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize group-hover:bg-blue-400"
                        style={{ userSelect: 'none' }}
                      ></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm" style={{ fontSize: 13 }}>
                {filteredRows.map((row, idx) => {
                  const realIdx = getRowIndex(row);
                  return (
                    <tr key={idx} className="text-black text-sm border-b border-gray-200 last:border-b-0" style={{ fontSize: 13 }}>
                      {/* Tanggal Posting (readonly, auto dari IG Content Plan) */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        {row.tanggal}
                      </td>
                      {/* Headline Content (readonly, auto dari IG Content Plan) */}
                      <td className="border px-2 py-2 text-sm border-gray-200 bg-white" style={{ fontSize: 13, textAlign: 'left' }}>
                        {row.headline}
                      </td>
                      {/* Jenis Content (readonly, auto dari IG Content Plan) */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        {row.jenis}
                      </td>
                      {/* Reach */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        <input
                          type="number"
                          className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                          value={row.reach}
                          onChange={e => handleAnalisaChange(realIdx, "reach", e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                      </td>
                      {/* Views */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        <input
                          type="number"
                          className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                          value={row.views}
                          onChange={e => handleAnalisaChange(realIdx, "views", e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                      </td>
                      {/* Like */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        <input
                          type="number"
                          className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                          value={row.like}
                          onChange={e => handleAnalisaChange(realIdx, "like", e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                      </td>
                      {/* Comment */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        <input
                          type="number"
                          className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                          value={row.comment}
                          onChange={e => handleAnalisaChange(realIdx, "comment", e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                      </td>
                      {/* Share */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        <input
                          type="number"
                          className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                          value={row.share}
                          onChange={e => handleAnalisaChange(realIdx, "share", e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                      </td>
                      {/* Save */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        <input
                          type="number"
                          className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                          value={row.save}
                          onChange={e => handleAnalisaChange(realIdx, "save", e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                      </td>
                      {/* ER (otomatis) */}
                      <td className="border px-2 py-2 text-center text-sm border-gray-200 bg-white" style={{ fontSize: 13 }}>
                        <input
                          type="text"
                          className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                          value={calculateER(row)}
                          readOnly
                          style={{ fontSize: 13 }}
                          title="ER = (Like + Comment + Share + Save) / Reach x 100%"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={deleteAllRows}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Hapus Semua
          </button>
        </div>
      </section>
    </div>
  );
}
