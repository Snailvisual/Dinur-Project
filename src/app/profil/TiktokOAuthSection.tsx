"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TiktokOAuthSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tiktokToken, setTiktokToken] = useState<string | null>(null);
  const [tiktokStatus, setTiktokStatus] = useState<string>("");
  const TIKTOK_CLIENT_ID = "aw53k1wh289o7jv";
  const TIKTOK_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/profil` : "";
  const TIKTOK_SCOPE = "user.info.basic,video.list,video.data,video.comment,video.like";

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tiktok_access_token");
      if (token) {
        setTiktokToken(token);
        setTiktokStatus("Terhubung ke TikTok");
      } else {
        setTiktokStatus("");
      }
    }
    const code = searchParams && searchParams.get ? searchParams.get("code") : null;
    if (code && !tiktokToken) {
      setTiktokStatus("Menghubungkan ke TikTok...");
      fetch("/api/tiktok-oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: TIKTOK_REDIRECT_URI })
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            setTiktokToken(data.access_token);
            localStorage.setItem("tiktok_access_token", data.access_token);
            setTiktokStatus("Terhubung ke TikTok");
            router.replace("/profil");
          } else {
            setTiktokStatus("Gagal menghubungkan TikTok");
          }
        })
        .catch(() => setTiktokStatus("Gagal menghubungkan TikTok"));
    }
  }, [searchParams, router, tiktokToken]);

  return (
    <div className="bg-white rounded-xl shadow flex flex-col gap-2 py-4 px-6 mt-4 items-center">
      <div className="text-sm font-semibold text-gray-700 mb-2">Integrasi TikTok</div>
      {tiktokToken ? (
        <div className="text-green-600 font-bold">{tiktokStatus}</div>
      ) : (
        <button
          className="px-4 py-2 rounded bg-[#010101] text-white font-bold shadow transition-all duration-150 hover:scale-105 hover:shadow-lg"
          onClick={() => {
            const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_ID}&response_type=code&scope=${encodeURIComponent(TIKTOK_SCOPE)}&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI)}&state=socialflow`;
            window.location.href = url;
          }}
        >
          Login TikTok
        </button>
      )}
    </div>
  );
}
