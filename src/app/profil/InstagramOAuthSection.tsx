"use client";
import React, { useCallback, useEffect, useState } from "react";

const INSTAGRAM_CLIENT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || "";
const INSTAGRAM_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/profil` : "";
const INSTAGRAM_SCOPE = "user_profile,user_media";

export default function InstagramOAuthSection({ btnClassName = "", icon, children }: { btnClassName?: string, icon?: React.ReactNode, children?: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Check if already connected
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("instagram_access_token");
      setIsConnected(!!token);
    }
  }, []);

  // Handle redirect from Instagram
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && !localStorage.getItem("instagram_access_token")) {
      setLoading(true);
      fetch("/api/instagram-oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem("instagram_access_token", data.access_token);
            setIsConnected(true);
            // Remove code param from URL
            const url = new URL(window.location.href);
            url.searchParams.delete("code");
            window.history.replaceState({}, document.title, url.pathname);
            window.location.reload();
          } else {
            setError("Gagal mendapatkan akses Instagram.");
          }
        })
        .catch(() => setError("Gagal login Instagram."))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleLogin = useCallback(() => {
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}&scope=${INSTAGRAM_SCOPE}&response_type=code`;
    window.location.href = authUrl;
  }, []);

  if (isConnected) {
    return (
      <button className={btnClassName + " bg-pink-400 cursor-default"} disabled>
        {icon}
        {children}
      </button>
    );
  }

  return (
    <button
      className={btnClassName + " bg-pink-500"}
      onClick={handleLogin}
      disabled={loading}
      type="button"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
    >
      {icon}
      {children}
    </button>
  );
}
