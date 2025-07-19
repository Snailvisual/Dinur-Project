"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaInstagram, FaTiktok } from "react-icons/fa6";
import { FaUserCircle, FaDatabase } from "react-icons/fa";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { FiChevronLeft } from "react-icons/fi";
import { useUser } from "./UserContext";
import { CgEnter } from "react-icons/cg";
import { usePathname } from "next/navigation";
import { FaRegChartBar, FaBullseye } from "react-icons/fa6";

export default function Sidebar() {
  const [hidden, setHidden] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  // Logic to toggle fullscreen layout
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (hidden) {
        document.body.classList.add('sidebar-hidden');
      } else {
        document.body.classList.remove('sidebar-hidden');
      }
    }
  }, [hidden]);

  return (
    <>
      <div
        className={`fixed top-6 left-6 z-40 transition-all duration-300 ${
          hidden ? "-translate-x-80 opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        } shadow-xl rounded-2xl bg-[#56ad9c] text-white flex flex-col p-6 w-64 h-[90vh]`}
        style={{ boxShadow: "0 8px 32px rgba(86,173,156,0.18)" }}
      >
        <div className="flex items-center mb-10">
          {user.sidebarLogo ? (
            <Image
              src={user.sidebarLogo}
              alt="Logo Sidebar"
              className="w-10 h-10 object-contain"
              width={150}
              height={60}
              style={{ background: 'none', borderRadius: 0, boxShadow: 'none', alignContent: "center" }}
            />
          ) : user.photo ? (
            <Image
              src={user.photo}
              alt="Logo User"
              className="w-10 h-10 rounded-lg object-cover bg-white"
              width={40}
              height={40}
              style={{ minWidth: 40, minHeight: 40 }}
            />
          ) : (
            <Image src="/globe.svg" alt="Logo" width={40} height={40} />
          )}
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          <a
            href="/dashboard"
            className={`hover:bg-white/20 rounded px-3 py-2 transition-colors font-normal flex items-center text-[15px] ${pathname === "/dashboard" ? "bg-white/80 text-[#56ad9c]" : ""}`}
          >
            <HiOutlineViewGrid size={20} className="mr-2" />
            Dashboard
          </a>
          <a
            href="/ig-content-plan"
            className={`hover:bg-white/20 rounded px-3 py-2 transition-colors font-normal flex items-center text-[15px] ${pathname === "/ig-content-plan" ? "bg-white/80 text-[#56ad9c]" : ""}`}
          >
            <FaInstagram size={20} className="mr-2" />
            Ig Content Plan
          </a>
          <a
            href="/tiktok-content-plan"
            className={`hover:bg-white/20 rounded px-3 py-2 transition-colors font-normal flex items-center text-[15px] ${pathname === "/tiktok-content-plan" ? "bg-white/80 text-[#56ad9c]" : ""}`}
          >
            <FaTiktok size={20} className="mr-2" />
            TikTok Content Plan
          </a>
          <a
            href="/ig-analisa"
            className={`hover:bg-white/20 rounded px-3 py-2 transition-colors font-normal flex items-center text-[15px] ${pathname === "/ig-analisa" ? "bg-white/80 text-[#56ad9c]" : ""}`}
          >
            <FaRegChartBar size={20} className="mr-2" />
            Content Insights
          </a>
          <a
            href="/kpi-target"
            className={`hover:bg-white/20 rounded px-3 py-2 transition-colors font-normal flex items-center text-[15px] ${pathname === "/kpi-target" ? "bg-white/80 text-[#56ad9c]" : ""}`}
          >
            <FaBullseye size={20} className="mr-2" />
            KPI Target
          </a>
          {user?.email === "admin@admin.com" && (
            <a
              href="/database"
              className={`hover:bg-white/20 rounded px-3 py-2 transition-colors font-normal flex items-center text-[15px] ${pathname === "/database" ? "bg-white/80 text-[#56ad9c]" : ""}`}
            >
              <FaDatabase size={20} className="mr-2" />
              Database
            </a>
          )}
        </nav>
        <a
          href="/profil"
          className="flex items-center gap-2 mt-auto text-white hover:bg-white/20 rounded px-3 py-2 transition-colors font-normal text-[15px]"
          style={{ fontSize: "15px" }}
        >
          <FaUserCircle size={18} />
          Profil
        </a>
        <button
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors"
          onClick={() => setHidden(true)}
          title="Sembunyikan Sidebar"
        >
          <FiChevronLeft size={22} />
        </button>
      </div>
      {hidden && (
        <button
          className="fixed top-8 left-2 z-50 bg-[#56ad9c] text-white rounded-full p-2 shadow-lg hover:bg-[#26796a] transition-colors"
          onClick={() => setHidden(false)}
          title="Tampilkan Sidebar"
        >
          <FiChevronLeft size={22} style={{ transform: "rotate(180deg)" }} />
        </button>
      )}
    </>
  );
}
