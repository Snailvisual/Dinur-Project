"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FiLock, FiUnlock } from "react-icons/fi";

const KPI_TARGET_KEY = "kpiTargetRows";
const CARD_WIDTH_KEY = "kpiCardWidth";
const CARD_WIDTH_TIKTOK_KEY = "kpiCardWidthTikTok";

const defaultRows = [
	{ platform: "Instagram", targetFollowers: "", targetER: "", targetReach: "" },
	{ platform: "TikTok", targetFollowers: "", targetER: "", targetViews: "" },
];

const DEFAULT_COL_WIDTHS = [120, 120, 100, 120, 120, 120, 120, 120, 120, 120, 120];

function useColumnWidths(defaults: number[], storageKey?: string) {
	const [widths, setWidths] = useState<number[]>(() => {
		if (storageKey && typeof window !== "undefined") {
			const saved = localStorage.getItem(storageKey);
			if (saved) {
				try {
					const arr = JSON.parse(saved);
					if (Array.isArray(arr) && arr.every(n => typeof n === "number")) return arr;
				} catch {}
			}
		}
		return defaults;
	});
	useEffect(() => {
		if (storageKey && typeof window !== "undefined") {
			localStorage.setItem(storageKey, JSON.stringify(widths));
		}
	}, [widths, storageKey]);
	const startResize = (idx: number, e: React.MouseEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const startWidth = widths[idx];
		function onMouseMove(ev: MouseEvent) {
			const delta = ev.clientX - startX;
			setWidths(w => w.map((w, i) => (i === idx ? Math.max(60, startWidth + delta) : w)));
		}
		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	};
	return { widths, startResize };
}

export default function KPITargetPage() {
	const months = useMemo(() => [
		"Januari",
		"Februari",
		"Maret",
		"April",
		"Mei",
		"Juni",
		"Juli",
		"Agustus",
		"September",
		"Oktober",
		"November",
		"Desember",
	], []);
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(currentYear);

	// Data KPI per bulan
	const [kpiRows, setKpiRows] = useState<any[]>([]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(KPI_TARGET_KEY + selectedYear);
			if (saved) {
				try {
					setKpiRows(JSON.parse(saved));
				} catch {
					setKpiRows(
						months.map((m, i) => ({
							month: m,
							ig: { targetFollowers: "", targetER: "", targetReach: "" },
							tiktok: { targetFollowers: "", targetER: "", targetViews: "" },
							year: selectedYear,
						}))
					);
				}
			} else {
				setKpiRows(
					months.map((m, i) => ({
						month: m,
						ig: { targetFollowers: "", targetER: "", targetReach: "" },
						tiktok: { targetFollowers: "", targetER: "", targetViews: "" },
						year: selectedYear,
					}))
				);
			}
		}
	}, [selectedYear]);

	function handleKPIChange(
		idx: number,
		platform: "ig" | "tiktok",
		field: string,
		value: string
	) {
		const updated = kpiRows.map((row, i) =>
			i === idx
				? { ...row, [platform]: { ...row[platform], [field]: value } }
				: row
		);
		setKpiRows(updated);
		if (typeof window !== "undefined") {
			localStorage.setItem(KPI_TARGET_KEY + selectedYear, JSON.stringify(updated));
		}
	}

	function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setSelectedYear(parseInt(e.target.value, 10));
	}

	const igCols = [
		"Bulan",
		"Followers",
		"ER %",
		"Total Reach",
		"Total Views",
		"Total Interaction",
		"Followers Tercapai",
		"ER % Tercapai",
		"Total Reach Tercapai",
		"Total Views Tercapai",
		"Total Interaction Tercapai",
	];
	const tiktokCols = [
		"Bulan",
		"Followers",
		"ER %",
		"Total Views",
		"Total Interaction",
		"Avg Watch Time (detik)",
		"Followers Tercapai",
		"ER % Tercapai",
		"Avg Watch Time Tercapai (detik)",
		"Total Views Tercapai",
		"Total Interaction Tercapai",
	];
	const igCol = useColumnWidths(DEFAULT_COL_WIDTHS, `kpiIGColWidths_${selectedYear}`);
	const tiktokCol = useColumnWidths(DEFAULT_COL_WIDTHS, `kpiTikTokColWidths_${selectedYear}`);
	const cardWidthKey = `kpiCardWidth_${selectedYear}`;
	const cardWidthTikTokKey = `kpiCardWidthTikTok_${selectedYear}`;
	const [cardWidth, setCardWidth] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(cardWidthKey);
			if (saved) return parseInt(saved, 10) || 700;
		}
		return 700;
	});
	const [cardWidthTikTok, setCardWidthTikTok] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(cardWidthTikTokKey);
			if (saved) return parseInt(saved, 10) || 700;
		}
		return 700;
	});
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(cardWidthKey);
			setCardWidth(saved ? parseInt(saved, 10) || 700 : 700);
			const savedTikTok = localStorage.getItem(cardWidthTikTokKey);
			setCardWidthTikTok(savedTikTok ? parseInt(savedTikTok, 10) || 700 : 700);
		}
	}, [selectedYear, cardWidthKey, cardWidthTikTokKey]);
	const startCardResize = (e: React.MouseEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const startWidth = cardWidth;
		function onMouseMove(ev: MouseEvent) {
			const delta = ev.clientX - startX;
			const newWidth = Math.max(400, startWidth + delta);
			setCardWidth(newWidth);
			if (typeof window !== "undefined") {
				localStorage.setItem(cardWidthKey, newWidth.toString());
			}
		}
		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	};
	const startCardResizeTikTok = (e: React.MouseEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const startWidth = cardWidthTikTok;
		function onMouseMove(ev: MouseEvent) {
			const delta = ev.clientX - startX;
			const newWidth = Math.max(400, startWidth + delta);
			setCardWidthTikTok(newWidth);
			if (typeof window !== "undefined") {
				localStorage.setItem(cardWidthTikTokKey, newWidth.toString());
			}
		}
		function onMouseUp() {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	};
	const lockKey = `kpiLockSize_${selectedYear}`;
	const [lockSize, setLockSize] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(lockKey);
			return saved === "true";
		}
		return false;
	});
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(lockKey);
			setLockSize(saved === "true");
		}
	}, [selectedYear, lockKey]); // Tambahkan lockKey ke dependency array useEffect terkait
	function handleLockSize() {
		setLockSize(true);
		if (typeof window !== "undefined") {
			localStorage.setItem(lockKey, "true");
		}
	}
	function handleUnlockSize() {
		setLockSize(false);
		if (typeof window !== "undefined") {
			localStorage.setItem(lockKey, "false");
		}
	}

	// State untuk insight IG per bulan
	const [insightData, setInsightData] = useState<Array<{ reach: string; views: string; interaction: string }>>([]);

	// Ambil data insight IG dari localStorage di client
	useEffect(() => {
		if (typeof window !== "undefined") {
			const igAnalisaRowsRaw = localStorage.getItem("igAnalisaRows");
			if (igAnalisaRowsRaw) {
				try {
					const igAnalisaRows = JSON.parse(igAnalisaRowsRaw);
					const dataPerMonth = months.map((_, monthIdx) => {
						const selectedYearNum = selectedYear;
						// Reach
						const reachTotal = igAnalisaRows
							.filter((r: any) => {
								if (!r.tanggal) return false;
								const d = new Date(r.tanggal);
								return (
									d.getMonth() === monthIdx &&
									d.getFullYear() === selectedYearNum &&
									r.reach && !isNaN(parseFloat(r.reach))
								);
							})
							.reduce((sum: number, r: any) => sum + parseFloat(r.reach), 0);
						// Views
						const viewsTotal = igAnalisaRows
							.filter((r: any) => {
								if (!r.tanggal) return false;
								const d = new Date(r.tanggal);
								return (
									d.getMonth() === monthIdx &&
									d.getFullYear() === selectedYearNum &&
									r.views && !isNaN(parseFloat(r.views))
								);
							})
							.reduce((sum: number, r: any) => sum + parseFloat(r.views), 0);
						// Interaction
						const interactionTotal = igAnalisaRows
							.filter((r: any) => {
								if (!r.tanggal) return false;
								const d = new Date(r.tanggal);
								return d.getMonth() === monthIdx && d.getFullYear() === selectedYearNum;
							})
							.reduce((sum: number, r: any) => {
								const like = parseFloat(r.like || "0");
								const comment = parseFloat(r.comment || "0");
								const share = parseFloat(r.share || "0");
								const save = parseFloat(r.save || "0");
								return sum + like + comment + share + save;
							}, 0);
						return {
							reach: reachTotal ? reachTotal.toString() : "",
							views: viewsTotal ? viewsTotal.toString() : "",
							interaction: interactionTotal ? interactionTotal.toString() : "",
						};
					});
					setInsightData(dataPerMonth);
				} catch {
					setInsightData(months.map(() => ({ reach: "", views: "", interaction: "" })));
				}
			} else {
				setInsightData(months.map(() => ({ reach: "", views: "", interaction: "" })));
			}
		}
	}, [selectedYear, months]);

	return (
		<div className="w-full py-10">
			<h1 className="text-3xl font-bold mb-6 text-[#56ad9c]">
				KPI Target Semua Platform
			</h1>
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<label className="font-semibold text-[#56ad9c]">Tahun:</label>
					<select
						value={selectedYear}
						onChange={handleYearChange}
						className="border rounded px-2 py-1"
					>
						{[...Array(6)].map((_, i) => (
							<option
								key={currentYear - 2 + i}
								value={currentYear - 2 + i}
							>
								{currentYear - 2 + i}
							</option>
						))}
					</select>
					<button
						className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold transition-colors duration-150 ${lockSize ? 'bg-gray-400 text-white' : 'bg-[#56ad9c] text-white'}`}
						onClick={lockSize ? handleUnlockSize : handleLockSize}
					>
						{lockSize ? <FiUnlock size={16} /> : <FiLock size={16} />}
						{lockSize ? 'Buka Ukuran' : 'Lock Ukuran'}
					</button>
				</div>
			</div>
			<div className="relative bg-white rounded-lg shadow p-6 mb-8 overflow-x-auto" style={{ width: cardWidth, background: '#fff' }}>
				<h2 className="text-2xl font-bold mb-4 text-[#56ad9c]">KPI Target Instagram</h2>
				<table className="w-full border-collapse" style={{ tableLayout: 'auto' }}>
					<thead>
						<tr>
							{igCols.map((col, idx) => {
								const isSoftHeader = [6, 7, 8, 9, 10].includes(idx); // followers tercapai, ER% tercapai, total reach tercapai, total views tercapai, total interaction tercapai
								return (
									<th
										key={col}
										className="p-3 text-center text-xs font-semibold relative select-none border-none"
										style={{
											width: igCol.widths[idx],
											minWidth: 60,
											maxWidth: 400,
											userSelect: 'none',
											position: 'relative',
											boxSizing: 'border-box',
											borderRight: 'none',
											background: isSoftHeader ? '#b7e3d8' : '#56ad9c',
											color: isSoftHeader ? '#26796a' : '#fff',
										}}
									>
										<span>{col}</span>
										{!lockSize && (
											<span
												className="absolute right-0 top-0 h-full cursor-col-resize flex items-center justify-center"
												style={{ zIndex: 10, background: 'transparent', position: 'absolute', right: 0, top: 0, height: '100%', width: '16px' }}
												onMouseDown={e => igCol.startResize(idx, e)}
											>
												{/* drag bar tanpa garis visual */}
											</span>
										)}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{kpiRows.map((row, ridx) => {
							// Ambil data insight dari state agar SSR dan client konsisten
							const insight = insightData[ridx] || { reach: "", views: "", interaction: "" };
							// Hitung ER% Tercapai otomatis: (interaction tercapai / followers tercapai) x 100
							const achievedFollowersNum = parseFloat(row.ig.achievedFollowers || "0");
							const achievedInteractionNum = parseFloat(insight.interaction || "0");
							let achievedER = "";
							if (achievedFollowersNum > 0) {
								achievedER = ((achievedInteractionNum / achievedFollowersNum) * 100).toFixed(2).replace(".", ",") + "%";
							}
							return (
								<tr key={row.month} className="border-b">
									<td style={{ width: igCol.widths[0], minWidth: 60, maxWidth: 400, background: '#dceeeb' }} className="p-3">
										<span className="text-[#56ad9c]">{row.month} {selectedYear}</span>
									</td>
									{/* IG Table */}
									<td style={{ width: igCol.widths[1], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input type="number" className={`rounded px-2 py-1 w-full bg-white text-center ${row.ig.targetFollowers ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.ig.targetFollowers || ""} onChange={e => handleKPIChange(ridx, "ig", "targetFollowers", e.target.value)} placeholder={row.ig.targetFollowers ? "Target" : ""} />
									</td>
									<td style={{ width: igCol.widths[2], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input type="number" step="0.01" className={`rounded px-2 py-1 w-full bg-white text-center ${row.ig.targetER ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.ig.targetER || ""} onChange={e => handleKPIChange(ridx, "ig", "targetER", e.target.value)} placeholder={row.ig.targetER ? "Target" : ""} />
									</td>
									<td style={{ width: igCol.widths[3], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input type="number" className={`rounded px-2 py-1 w-full bg-white text-center ${row.ig.targetReach ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.ig.targetReach || ""} onChange={e => handleKPIChange(ridx, "ig", "targetReach", e.target.value)} placeholder={row.ig.targetReach ? "Target" : ""} />
									</td>
									<td style={{ width: igCol.widths[4], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input type="number" className={`rounded px-2 py-1 w-full bg-white text-center ${row.ig.targetViews ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.ig.targetViews || ""} onChange={e => handleKPIChange(ridx, "ig", "targetViews", e.target.value)} placeholder={row.ig.targetViews ? "Target" : ""} />
									</td>
									<td style={{ width: igCol.widths[5], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input type="number" className={`rounded px-2 py-1 w-full bg-white text-center ${row.ig.targetInteraction ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.ig.targetInteraction || ""} onChange={e => handleKPIChange(ridx, "ig", "targetInteraction", e.target.value)} placeholder={row.ig.targetInteraction ? "Target" : ""} />
									</td>
									{/* IG Table Metrics Result */}
									<td style={{ width: igCol.widths[6], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input
											type="number"
											className={`rounded px-2 py-1 w-full text-center ${row.ig.achievedFollowers ? 'text-[#56ad9c]' : 'text-[#dfdddd]'} bg-white`}
											value={row.ig.achievedFollowers || ''}
											onChange={e => handleKPIChange(ridx, 'ig', 'achievedFollowers', e.target.value)}
											placeholder={row.ig.achievedFollowers ? "Tercapai" : ""}
											style={{ border: 'none', background: '#fff' }}
										/>
									</td>
									<td style={{ width: igCol.widths[7], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input
											type="text"
											className={`rounded px-2 py-1 w-full text-center text-[#56ad9c] bg-white`}
											value={achievedER}
											readOnly
											placeholder={achievedER ? "Tercapai" : ""}
											style={{ background: '#fff' }}
										/>
									</td>
									<td style={{ width: igCol.widths[8], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input
											type="number"
											className={`rounded px-2 py-1 w-full text-center text-[#56ad9c] bg-white`}
											value={insight.reach}
											readOnly
											placeholder={insight.reach ? "Tercapai" : ""}
											style={{ border: 'none', background: '#fff' }}
										/>
									</td>
									<td style={{ width: igCol.widths[9], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input
											type="number"
											className={`rounded px-2 py-1 w-full text-center text-[#56ad9c] bg-white`}
											value={insight.views}
											readOnly
											placeholder={insight.views ? "Tercapai" : ""}
											style={{ border: 'none', background: '#fff' }}
										/>
									</td>
									<td style={{ width: igCol.widths[10], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
										<input
											type="number"
											className={`rounded px-2 py-1 w-full text-center text-[#56ad9c] bg-white`}
											value={insight.interaction}
											readOnly
											placeholder={insight.interaction ? "Tercapai" : ""}
											style={{ border: 'none', background: '#fff' }}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<span
					className="absolute right-0 top-0 h-full w-3 cursor-col-resize flex items-center justify-center"
					style={{ zIndex: 30, background: 'rgba(86,173,156,0.15)', position: 'absolute', right: 0, top: 0, height: '100%', width: '12px', borderRadius: '0 8px 8px 0' }}
					onMouseDown={!lockSize ? startCardResize : undefined}
					title="Drag untuk mengubah lebar card"
				>
					{/* drag bar tanpa garis hijau visual */}
				</span>
			</div>
			<div className="relative bg-white rounded-lg shadow p-6 overflow-x-auto" style={{ width: cardWidthTikTok, background: '#fff' }}>
				<h2 className="text-2xl font-bold mb-4 text-[#56ad9c]">KPI Target TikTok</h2>
				<table className="w-full border-collapse" style={{ tableLayout: 'auto' }}>
					<thead>
						<tr>
							{tiktokCols.map((col, idx) => {
								const isSoftHeader = [6, 7, 8, 9, 10].includes(idx); // followers tercapai, ER% tercapai, avg watch time tercapai, total views tercapai, total interaction tercapai
								return (
									<th
										key={col}
										className="p-3 text-center text-xs font-semibold relative select-none border-none"
										style={{
											width: tiktokCol.widths[idx],
											minWidth: 60,
											maxWidth: 400,
											userSelect: 'none',
											position: 'relative',
											boxSizing: 'border-box',
											borderRight: 'none',
											background: isSoftHeader ? '#b7e3d8' : '#56ad9c',
											color: isSoftHeader ? '#26796a' : '#fff',
										}}
									>
										<span>{col}</span>
										{!lockSize && (
											<span
												className="absolute right-0 top-0 h-full cursor-col-resize flex items-center justify-center"
												style={{ zIndex: 10, background: 'transparent', position: 'absolute', right: 0, top: 0, height: '100%', width: '16px' }}
												onMouseDown={e => tiktokCol.startResize(idx, e)}
											>
												{/* drag bar tanpa garis visual */}
											</span>
										)}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{kpiRows.map((row, ridx) => (
							<tr key={row.month} className="border-b">
								<td style={{ width: tiktokCol.widths[0], minWidth: 60, maxWidth: 400, background: '#dceeeb' }} className="p-3">
									<span className="text-[#56ad9c]">{row.month} {selectedYear}</span>
								</td>
								{/* TikTok Table */}
								<td style={{ width: tiktokCol.widths[1], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input type="number" className={`rounded px-2 py-1 w-full bg-white text-center ${row.tiktok.targetFollowers ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.tiktok.targetFollowers || ""} onChange={e => handleKPIChange(ridx, "tiktok", "targetFollowers", e.target.value)} placeholder={row.tiktok.targetFollowers ? "Target" : ""} />
								</td>
								<td style={{ width: tiktokCol.widths[2], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input type="number" step="0.01" className={`rounded px-2 py-1 w-full bg-white text-center ${row.tiktok.targetER ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.tiktok.targetER || ""} onChange={e => handleKPIChange(ridx, "tiktok", "targetER", e.target.value)} placeholder={row.tiktok.targetER ? "Target" : ""} />
								</td>
								<td style={{ width: tiktokCol.widths[3], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input type="number" className={`rounded px-2 py-1 w-full bg-white text-center ${row.tiktok.targetViews ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.tiktok.targetViews || ""} onChange={e => handleKPIChange(ridx, "tiktok", "targetViews", e.target.value)} placeholder={row.tiktok.targetViews ? "Target" : ""} />
								</td>
								<td style={{ width: tiktokCol.widths[4], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input type="number" className={`rounded px-2 py-1 w-full bg-white text-center ${row.tiktok.targetInteraction ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.tiktok.targetInteraction || ""} onChange={e => handleKPIChange(ridx, "tiktok", "targetInteraction", e.target.value)} placeholder={row.tiktok.targetInteraction ? "Target" : ""} />
								</td>
								<td style={{ width: tiktokCol.widths[5], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input type="number" step="0.01" className={`rounded px-2 py-1 w-full bg-white text-center ${row.tiktok.avgWatchTime ? 'text-[#56ad9c]' : 'text-[#dfdddd]'}`} style={{ border: 'none', background: '#fff' }} value={row.tiktok.avgWatchTime || ""} onChange={e => handleKPIChange(ridx, "tiktok", "avgWatchTime", e.target.value)} placeholder={row.tiktok.avgWatchTime ? "Detik" : ""} />
								</td>
								{/* TikTok Table Metrics Result */}
								<td style={{ width: tiktokCol.widths[6], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input type="number" className={`rounded px-2 py-1 w-full text-center ${row.tiktok.achievedFollowers ? 'text-[#56ad9c]' : 'text-[#dfdddd]'} bg-white`} value={row.tiktok.achievedFollowers || ""} onChange={e => handleKPIChange(ridx, "tiktok", "achievedFollowers", e.target.value)} placeholder={row.tiktok.achievedFollowers ? "Tercapai" : ""} style={{ border: 'none', background: '#fff' }} />
								</td>
								<td style={{ width: tiktokCol.widths[7], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input
										type="number"
										step="0.01"
										className={`rounded px-2 py-1 w-full text-center ${row.tiktok.achievedER ? 'text-[#56ad9c]' : 'text-[#dfdddd]'} bg-white`}
										value={row.tiktok.achievedER || ""}
										onChange={e => handleKPIChange(ridx, "tiktok", "achievedER", e.target.value)}
										placeholder={row.tiktok.achievedER ? "Tercapai" : ""}
										style={{ border: 'none', background: '#fff' }}
									/>
								</td>
								<td style={{ width: tiktokCol.widths[8], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input
										type="number"
										step="0.01"
										className={`rounded px-2 py-1 w-full text-center ${row.tiktok.achievedAvgWatchTime ? 'text-[#56ad9c]' : 'text-[#dfdddd]'} bg-white`}
										value={row.tiktok.achievedAvgWatchTime || ""}
										onChange={e => handleKPIChange(ridx, "tiktok", "achievedAvgWatchTime", e.target.value)}
										placeholder={row.tiktok.achievedAvgWatchTime ? "Detik" : ""}
										style={{ border: 'none', background: '#fff' }}
									/>
								</td>
								<td style={{ width: tiktokCol.widths[9], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input
										type="number"
										className={`rounded px-2 py-1 w-full text-center ${row.tiktok.achievedViews ? 'text-[#56ad9c]' : 'text-[#dfdddd]'} bg-white`}
										value={row.tiktok.achievedViews || ""}
										onChange={e => handleKPIChange(ridx, "tiktok", "achievedViews", e.target.value)}
										placeholder={row.tiktok.achievedViews ? "Tercapai" : ""}
										style={{ border: 'none', background: '#fff' }}
									/>
								</td>
								<td style={{ width: tiktokCol.widths[10], minWidth: 60, maxWidth: 400, background: '#fff' }} className="p-3">
									<input
										type="number"
										className={`rounded px-2 py-1 w-full text-center ${row.tiktok.achievedInteraction ? 'text-[#56ad9c]' : 'text-[#dfdddd]'} bg-white`}
										value={row.tiktok.achievedInteraction || ""}
										onChange={e => handleKPIChange(ridx, "tiktok", "achievedInteraction", e.target.value)}
										placeholder={row.tiktok.achievedInteraction ? "Tercapai" : ""}
										style={{ border: 'none', background: '#fff' }}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<span
					className="absolute right-0 top-0 h-full w-3 cursor-col-resize flex items-center justify-center"
					style={{ zIndex: 30, background: 'rgba(86,173,156,0.15)', position: 'absolute', right: 0, top: 0, height: '100%', width: '12px', borderRadius: '0 8px 8px 0' }}
					onMouseDown={!lockSize ? startCardResizeTikTok : undefined}
					title="Drag untuk mengubah lebar card TikTok"
				>
					{/* drag bar tanpa garis hijau visual */}
				</span>
			</div>
		</div>
	);
}
