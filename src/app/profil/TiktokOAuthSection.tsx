"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TiktokOAuthSection({ btnClassName = "px-8 py-2 rounded bg-black text-white font-bold shadow text-base transition-all duration-150 hover:scale-105 hover:shadow-lg w-44 text-center", icon, children }: { btnClassName?: string, icon?: React.ReactNode, children?: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tiktokToken, setTiktokToken] = useState<string | null>(null);
  const [tiktokStatus, setTiktokStatus] = useState<string>("");
  const TIKTOK_CLIENT_ID = "aw53k1vvh289o7jv";
  const TIKTOK_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/profil` : "";
  const TIKTOK_SCOPE = "user.info.basic,video.list,video.data,video.comment,video.like";

  // PKCE helpers
  function generateCodeVerifier(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  async function generateCodeChallenge(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  }

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
      // PKCE: ambil code_verifier dari localStorage
      const codeVerifier = localStorage.getItem('tiktok_code_verifier');
      fetch("/api/tiktok-oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: TIKTOK_REDIRECT_URI, code_verifier: codeVerifier })
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

  const handleTiktokLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem('tiktok_code_verifier', codeVerifier);
    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_ID}&response_type=code&scope=${encodeURIComponent(TIKTOK_SCOPE)}&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI)}&state=socialflow&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = url;
  };

  return (
    <div className="bg-black rounded shadow flex flex-col gap-1 py-4 px-8 mt-0 items-center">
      {tiktokToken ? (
        <div className="text-green-600 font-bold">{tiktokStatus}</div>
      ) : (
        <button
          className={btnClassName}
          onClick={handleTiktokLogin}
          type="button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {icon}
          {children}
        </button>
      )}
    </div>
  );
}
