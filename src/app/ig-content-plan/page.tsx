"use client";

import React, { useState, useRef, useEffect } from "react";
import LoginPage from "../login/page";

interface ContentPlanRow {
  tanggal: string;
  status: string;
  pic: string;
  value: string;
  objective: string;
  jenis: string;
  headline: string;
  script: string;
  visual: string;
  link: string;
}

const initialRow: ContentPlanRow = {
  tanggal: "",
  status: "",
  pic: "",
  value: "",
  objective: "",
  jenis: "",
  headline: "",
  script: "",
  visual: "",
  link: "",
};

export default function ContentPlanPage() {
  const [rows, setRows] = useState<ContentPlanRow[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("contentPlanRows");
      if (saved) return JSON.parse(saved);
    }
    return [initialRow];
  });
  const [colWidths, setColWidths] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("contentPlanColWidths");
      if (saved) return JSON.parse(saved);
    }
    // Semua kolom default 120 agar seragam
    return [120, 120, 120, 120, 120, 120, 120, 120, 120, 120];
  });
  const [editingDateIdx, setEditingDateIdx] = useState<number | null>(null);
  const resizingCol = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

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

  const handleChange = (idx: number, field: keyof ContentPlanRow, value: string) => {
    const updated = rows.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    );
    setRows(updated);
  };

  const addRow = () => setRows([...rows, initialRow]);
  const deleteAllRows = () => {
    setRows([]);
    setScriptFiles({});
    setVisualFiles({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('contentPlanScriptFiles');
      localStorage.removeItem('contentPlanVisualFiles');
    }
  };

  // State untuk opsi dropdown
  const [statusOptions, setStatusOptions] = useState([
    { value: "Draft", label: "Draft", color: "bg-gray-300 text-gray-800" },
    { value: "Progress", label: "Progress", color: "bg-yellow-200 text-yellow-800" },
    { value: "Posted!", label: "Posted!", color: "bg-green-200 text-green-800" },
    { value: "Revisi", label: "Revisi", color: "bg-red-200 text-red-800" },
  ]);
  const [contentValueOptions, setContentValueOptions] = useState([
    { value: "Awareness", label: "Awareness", color: "bg-blue-200 text-blue-800" },
    { value: "Engagement", label: "Engagement", color: "bg-purple-200 text-purple-800" },
    { value: "Conversion", label: "Conversion", color: "bg-green-200 text-green-800" },
    { value: "Retention", label: "Retention", color: "bg-yellow-200 text-yellow-800" },
  ]);
  const [objectiveOptions, setObjectiveOptions] = useState([
    { value: "Branding", label: "Branding", color: "bg-blue-100 text-blue-800" },
    { value: "Leads", label: "Leads", color: "bg-green-100 text-green-800" },
    { value: "Sales", label: "Sales", color: "bg-yellow-100 text-yellow-800" },
    { value: "Traffic", label: "Traffic", color: "bg-purple-100 text-purple-800" },
  ]);
  const [jenisKontenOptions, setJenisKontenOptions] = useState([
    { value: "Feed", label: "Feed", color: "bg-pink-200 text-pink-800" },
    { value: "Story", label: "Story", color: "bg-orange-200 text-orange-800" },
    { value: "Reels", label: "Reels", color: "bg-green-200 text-green-800" },
    { value: "Video", label: "Video", color: "bg-blue-200 text-blue-800" },
    { value: "Artikel", label: "Artikel", color: "bg-yellow-200 text-yellow-800" },
  ]);

  // Helper: get color class for capsule style
  const getCapsuleColor = (type: string, value: string) => {
    let opt;
    if (type === "status") opt = statusOptions.find(o => o.value === value);
    if (type === "value") opt = contentValueOptions.find(o => o.value === value);
    if (type === "objective") opt = objectiveOptions.find(o => o.value === value);
    if (type === "jenis") opt = jenisKontenOptions.find(o => o.value === value);
    return opt ? opt.color : "bg-gray-100 text-gray-800";
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

  // Helper untuk persist file scriptwriting di localStorage
  const SCRIPT_FILE_KEY = 'contentPlanScriptFiles';
  const getInitialScriptFiles = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_FILE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return {};
  };

  const [scriptFiles, setScriptFiles] = useState<{ [rowIdx: number]: { name: string; url: string } | null }>(getInitialScriptFiles);

  // Helper untuk persist file visual di localStorage
  const VISUAL_FILE_KEY = 'contentPlanVisualFiles';
  const getInitialVisualFiles = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VISUAL_FILE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return {};
  };
  const [visualFiles, setVisualFiles] = useState<{ [rowIdx: number]: { name: string; url: string } | null }>(getInitialVisualFiles);

  // State untuk modal preview PDF
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  // State untuk modal preview gambar
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string | null>(null);

  // Persist file scriptwriting ke localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCRIPT_FILE_KEY, JSON.stringify(scriptFiles));
    }
  }, [scriptFiles]);
  // Persist file visual ke localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VISUAL_FILE_KEY, JSON.stringify(visualFiles));
    }
  }, [visualFiles]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("contentPlanRows", JSON.stringify(rows));
      localStorage.setItem("contentPlanColWidths", JSON.stringify(colWidths));
    }
  }, [rows, colWidths]);

  return (
    <div className="space-y-8">
      {/* Modal PDF Preview */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/40">
          <div className="bg-gradient-to-br from-[#56ad9c]/10 to-[#56ad9c]/40 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col relative border-2 border-[#56ad9c] animate-fadeIn">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#56ad9c] to-[#56ad9c]/80 rounded-t-2xl border-b border-[#56ad9c]/30">
              <span className="text-lg font-bold text-white">Preview PDF</span>
              <button
                className="text-white hover:text-red-200 text-2xl font-bold focus:outline-none transition-colors"
                onClick={() => setPdfPreviewUrl(null)}
                aria-label="Tutup preview PDF"
              >
                ×
              </button>
            </div>
            {/* Konten Modal */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-b-2xl p-4 overflow-hidden">
              {pdfPreviewUrl === 'ERROR:INVALID_PDF' ? (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <span className="text-red-600 font-bold text-lg mb-2">File PDF tidak valid atau tidak dapat dipreview.</span>
                  <span className="text-gray-500">Pastikan file PDF yang diupload benar dan tidak corrupt.</span>
                </div>
              ) : (
                <iframe
                  src={pdfPreviewUrl}
                  title="PDF Preview"
                  className="w-full h-[70vh] rounded-lg shadow-lg border border-purple-100 bg-gray-50"
                  style={{ minHeight: 400 }}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal Preview Gambar Visual */}
      {imgPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/40">
          <div className="bg-gradient-to-br from-[#56ad9c]/10 to-[#56ad9c]/40 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col relative border-2 border-[#56ad9c] animate-fadeIn">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#56ad9c] to-[#56ad9c]/80 rounded-t-2xl border-b border-[#56ad9c]/30">
              <span className="text-lg font-bold text-white">Preview Gambar</span>
              <button
                className="text-white hover:text-red-200 text-2xl font-bold focus:outline-none transition-colors"
                onClick={() => setImgPreviewUrl(null)}
                aria-label="Tutup preview gambar"
              >
                ×
              </button>
            </div>
            {/* Konten Modal */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-b-2xl p-4 overflow-auto">
              <img
                src={imgPreviewUrl}
                alt="Preview Visual Content"
                className="max-h-[60vh] max-w-full rounded-lg shadow-lg border border-purple-100 bg-gray-50 object-contain"
              />
            </div>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4 text-[#56ad9c]">Instagram Content Plan</h1>
      <section className="bg-gradient-to-r from-[#56ad9c]/10 to-[#56ad9c]/40 rounded-lg shadow p-6">
        <button
          onClick={addRow}
          className="mb-4 px-4 py-2 bg-[#56ad9c] text-white rounded hover:bg-[#469c8a] transition-colors text-sm"
        >
          + Tambah Baris
        </button>
        <div className="relative mt-2 w-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#56ad9c] scrollbar-track-[#56ad9c]/10 pb-2" style={{ position: 'relative', zIndex: 1 }}>
            <table className="table-auto w-max min-w-full bg-white rounded-lg text-sm border border-gray-300" style={{ fontSize: 13 }}>
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={i} style={{ width: w }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-[#56ad9c] text-white select-none text-sm border-b border-gray-300" style={{ fontSize: 13 }}>
                  {[
                    "Tanggal Posting","Status Posting","PIC","Content Value","Objective","Jenis Konten","Headline Konten","Scriptwriting Konten","Visual Konten","Link Posting"
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
                {rows.map((row, idx) => (
                  <tr key={idx} className="text-black text-sm border-b border-gray-200 last:border-b-0" style={{ fontSize: 13 }}>
                    {/* Tanggal Posting */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      {editingDateIdx === idx ? (
                        <input
                          type="date"
                          className="w-full bg-[#56ad9c]/10 rounded px-2 py-1 text-black text-sm"
                          value={row.tanggal}
                          autoFocus
                          onBlur={() => setEditingDateIdx(null)}
                          onChange={e => handleChange(idx, "tanggal", e.target.value)}
                          style={{ fontSize: 13 }}
                        />
                      ) : (
                        <div
                          className="w-full h-full cursor-pointer px-2 py-1 rounded hover:bg-[#56ad9c]/10 text-sm"
                          onDoubleClick={() => setEditingDateIdx(idx)}
                          tabIndex={0}
                          role="button"
                          title="Double click to edit"
                          style={{ fontSize: 13 }}
                        >
                          {row.tanggal ? formatTanggal(row.tanggal) : <span className="text-gray-400 text-sm" style={{ fontSize: 13 }}>Pilih tanggal</span>}
                        </div>
                      )}
                    </td>
                    {/* Status Posting dropdown */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <div className="relative text-sm" style={{ fontSize: 13 }}>
                        <select
                          className={`w-full appearance-none px-2 py-0.5 text-sm text-black focus:outline-none transition-colors ${statusOptions.find(opt => opt.value === row.status)?.color || ''} rounded-full border border-gray-300 pr-6 text-center min-h-[28px]`}
                          value={row.status}
                          onChange={e => handleChange(idx, "status", e.target.value)}
                          style={{ minHeight: 28, height: 28, fontSize: 13 }}
                        >
                          <option value="">Pilih Status</option>
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-sm" style={{ fontSize: 13 }}>{opt.label}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </td>
                    {/* PIC */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <input
                        type="text"
                        placeholder="PIC"
                        className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                        value={row.pic}
                        onChange={e => handleChange(idx, "pic", e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                    </td>
                    {/* Content Value dropdown */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <div className="relative text-sm" style={{ fontSize: 13 }}>
                        <select
                          className={`w-full appearance-none px-2 py-0.5 text-sm text-black focus:outline-none transition-colors ${contentValueOptions.find(opt => opt.value === row.value)?.color || ''} rounded-full border border-gray-300 pr-6 text-center min-h-[28px]`}
                          value={row.value}
                          onChange={e => handleChange(idx, "value", e.target.value)}
                          style={{ minHeight: 28, height: 28, fontSize: 13 }}
                        >
                          <option value="">Pilih Value</option>
                          {contentValueOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-sm" style={{ fontSize: 13 }}>{opt.label}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </td>
                    {/* Objective dropdown */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <div className="relative text-sm" style={{ fontSize: 13 }}>
                        <select
                          className={`w-full appearance-none px-2 py-0.5 text-sm text-black focus:outline-none transition-colors ${objectiveOptions.find(opt => opt.value === row.objective)?.color || ''} rounded-full border border-gray-300 pr-6 text-center min-h-[28px]`}
                          value={row.objective}
                          onChange={e => handleChange(idx, "objective", e.target.value)}
                          style={{ minHeight: 28, height: 28, fontSize: 13 }}
                        >
                          <option value="">Pilih Objective</option>
                          {objectiveOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-sm" style={{ fontSize: 13 }}>{opt.label}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </td>
                    {/* Jenis Konten dropdown */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <div className="relative text-sm" style={{ fontSize: 13 }}>
                        <select
                          className={`w-full appearance-none px-2 py-0.5 text-sm text-black focus:outline-none transition-colors ${jenisKontenOptions.find(opt => opt.value === row.jenis)?.color || ''} rounded-full border border-gray-300 pr-6 text-center min-h-[28px]`}
                          value={row.jenis}
                          onChange={e => handleChange(idx, "jenis", e.target.value)}
                          style={{ minHeight: 28, height: 28, fontSize: 13 }}
                        >
                          <option value="">Pilih Jenis</option>
                          {jenisKontenOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-sm" style={{ fontSize: 13 }}>{opt.label}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </div>
                    </td>
                    {/* Headline Konten (tetap kiri) */}
                    <td className="border px-2 py-2 text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <input
                        type="text"
                        placeholder="Headline Konten"
                        className="w-full bg-white rounded px-2 py-1 text-black text-sm"
                        value={row.headline}
                        onChange={e => handleChange(idx, "headline", e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                    </td>
                    {/* Scriptwriting Konten */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <div className="flex flex-col items-center gap-2 text-sm" style={{ fontSize: 13 }}>
                        {/* Nama file di atas tombol */}
                        {scriptFiles[idx] && (
                          <div className="flex items-center gap-1 text-gray-600 truncate max-w-[120px] mb-1 text-sm" style={{ fontSize: 13 }} title={scriptFiles[idx].name}>
                            <span className="truncate text-sm" style={{ fontSize: 13 }}>{scriptFiles[idx].name}</span>
                            <button
                              type="button"
                              className="ml-1 text-red-400 hover:text-red-600 focus:outline-none text-sm"
                              title="Hapus file"
                              style={{ fontSize: 13 }}
                              onClick={() => {
                                setScriptFiles(prev => {
                                  const updated = { ...prev };
                                  delete updated[idx];
                                  return updated;
                                });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M7.5 8.5v5m5-5v5M3 6.5h14M8.333 3.5h3.334c.46 0 .833.373.833.833V5.5h-5v-1.167c0-.46.373-.833.833-.833ZM5.5 6.5v9.167c0 .92.746 1.666 1.667 1.666h5.666c.92 0 1.667-.746 1.667-1.666V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 w-full justify-center text-sm" style={{ fontSize: 13 }}>
                          {!scriptFiles[idx] && (
                            <label className="cursor-pointer bg-[#56ad9c]/10 hover:bg-[#56ad9c]/20 text-[#56ad9c] px-2 py-1 rounded font-normal border border-[#56ad9c] text-sm" style={{ fontSize: 13, fontWeight: 400 }}>
                              Upload
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.rtf,.md,.xls,.xlsx,.ppt,.pptx,.csv,.json,.xml,.html,.js,.ts,.py,.java,.c,.cpp,.zip,.rar,.7z,.mp3,.wav,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif,.svg,.webp"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = ev => {
                                      let url = ev.target?.result as string;
                                      // Jika PDF, pastikan data url bertipe application/pdf
                                      if (file.type === 'application/pdf' && !url.startsWith('data:application/pdf')) {
                                        // Paksa prefix ke data:application/pdf;base64,
                                        const base64 = url.split(',')[1];
                                        url = `data:application/pdf;base64,${base64}`;
                                      }
                                      setScriptFiles(prev => ({
                                        ...prev,
                                        [idx]: { name: file.name, url }
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                          {scriptFiles[idx] && (
                            <button
                              type="button"
                              onClick={() => {
                                const file = scriptFiles[idx];
                                if (file && file.url) {
                                  if (file.name.toLowerCase().endsWith('.pdf')) {
                                    // Validasi url PDF
                                    if (file.url.startsWith('data:application/pdf')) {
                                      setPdfPreviewUrl(file.url);
                                    } else {
                                      setPdfPreviewUrl('ERROR:INVALID_PDF');
                                    }
                                  } else {
                                    window.open(file.url, '_blank', 'noopener,noreferrer');
                                  }
                                }
                              }}
                              className="bg-[#56ad9c]/10 hover:bg-[#56ad9c]/20 text-[#56ad9c] px-2 py-1 rounded font-normal border border-[#56ad9c] transition-colors text-sm"
                              title={scriptFiles[idx]?.name}
                              style={{ fontSize: 13, fontWeight: 400 }}
                            >
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Visual Konten */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <div className="flex flex-col items-center gap-2 text-sm" style={{ fontSize: 13 }}>
                        {/* Nama file di atas tombol */}
                        {visualFiles[idx] && (
                          <div className="flex items-center gap-1 text-gray-600 truncate max-w-[120px] mb-1 text-sm" style={{ fontSize: 13 }} title={visualFiles[idx].name}>
                            <span className="truncate text-sm" style={{ fontSize: 13 }}>{visualFiles[idx].name}</span>
                            <button
                              type="button"
                              className="ml-1 text-red-400 hover:text-red-600 focus:outline-none text-sm"
                              title="Hapus file"
                              style={{ fontSize: 13 }}
                              onClick={() => {
                                setVisualFiles(prev => {
                                  const updated = { ...prev };
                                  delete updated[idx];
                                  return updated;
                                });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M7.5 8.5v5m5-5v5M3 6.5h14M8.333 3.5h3.334c.46 0 .833.373.833.833V5.5h-5v-1.167c0-.46.373-.833.833-.833ZM5.5 6.5v9.167c0 .92.746 1.666 1.667 1.666h5.666c.92 0 1.667-.746 1.667-1.666V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 w-full justify-center text-sm" style={{ fontSize: 13 }}>
                          {!visualFiles[idx] && (
                            <label className="cursor-pointer bg-[#56ad9c]/10 hover:bg-[#56ad9c]/20 text-[#56ad9c] px-2 py-1 rounded font-normal border border-[#56ad9c] text-sm" style={{ fontSize: 13, fontWeight: 400 }}>
                              Upload
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = ev => {
                                      setVisualFiles(prev => ({
                                        ...prev,
                                        [idx]: { name: file.name, url: ev.target?.result as string }
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                          {visualFiles[idx] && (
                            <button
                              type="button"
                              onClick={() => {
                                const file = visualFiles[idx];
                                if (file && file.url) {
                                  setImgPreviewUrl(file.url);
                                }
                              }}
                              className="bg-[#56ad9c]/10 hover:bg-[#56ad9c]/20 text-[#56ad9c] px-2 py-1 rounded font-normal border border-[#56ad9c] transition-colors text-sm"
                              title={visualFiles[idx]?.name}
                              style={{ fontSize: 13, fontWeight: 400 }}
                            >
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Link Posting */}
                    <td className="border px-2 py-2 text-center text-sm border-gray-200" style={{ fontSize: 13 }}>
                      <div className="flex flex-col items-center gap-1">
                        {row.link && row.link.trim() !== '' ? (
                          <div className="flex flex-col items-center w-full">
                            <div className="flex items-center justify-center gap-2 w-full">
                              <a
                                href={row.link.startsWith('http') ? row.link : `https://${row.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-xs hover:text-blue-800 transition-colors break-all w-full text-center"
                                title={row.link}
                              >
                                {row.link}
                              </a>
                              <button
                                type="button"
                                className="ml-1 text-gray-400 hover:text-blue-600 p-1 rounded focus:outline-none"
                                title="Edit Link"
                                onClick={() => handleChange(idx, 'link', '')}
                              >
                                {/* Icon edit (pencil) */}
                                <svg width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M13.5 4.5l2 2M5 15l8.5-8.5a1.414 1.414 0 0 1 2 2L7 17H5v-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                              <button
                                type="button"
                                className="ml-1 text-gray-400 hover:text-red-600 p-1 rounded focus:outline-none"
                                title="Hapus Link"
                                onClick={() => handleChange(idx, 'link', '')}
                              >
                                {/* Icon trash */}
                                <svg width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M7.5 8.5v5m5-5v5M3 6.5h14M8.333 3.5h3.334c.46 0 .833.373.833.833V5.5h-5v-1.167c0-.46.373-.833.833-.833ZM5.5 6.5v9.167c0 .92.746 1.666 1.667 1.666h5.666c.92 0 1.667-.746 1.667-1.666V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Link Posting"
                            className="w-full bg-white rounded px-2 py-1 text-black text-center text-sm"
                            value={row.link}
                            onChange={e => handleChange(idx, "link", e.target.value)}
                            style={{ fontSize: 13 }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
          <button
            onClick={() => {
              // TODO: Implement export to Excel
              alert("Fitur ini belum tersedia.");
            }}
            className="px-4 py-2 bg-[#56ad9c] text-white rounded hover:bg-[#469c8a] transition-colors text-sm"
          >
            Export ke Excel
          </button>
        </div>
      </section>
    </div>
  );
}
