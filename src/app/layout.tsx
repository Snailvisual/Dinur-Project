"use client";

import "./globals.css";
import Sidebar from "./Sidebar";
import React, { useState, useEffect } from "react";
import { UserContextProvider } from "./UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    photo: string;
    email: string;
  }>({
    name: "Nama User",
    photo:
      "https://ui-avatars.com/api/?name=Nama+User&background=56ad9c&color=fff",
    email: "user@email.com",
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handler = () => {
        setSidebarHidden(document.body.classList.contains("sidebar-hidden"));
      };
      handler();
      window.addEventListener("resize", handler);
      const observer = new MutationObserver(handler);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => {
        window.removeEventListener("resize", handler);
        observer.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          setUser({
            name: parsed.nama || parsed.name || "Nama User",
            photo:
              parsed.photo ||
              "https://ui-avatars.com/api/?name=" +
                (parsed.nama || parsed.name || "User") +
                "&background=56ad9c&color=fff",
            email: parsed.email || "user@email.com",
          });
        } catch {}
      }
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={`${"antialiased"}`}
      >
        <UserContextProvider>
          <div className="flex min-h-screen">
            <aside className="sticky left-0 top-0 h-screen w-0 shrink-0 z-20">
              <Sidebar />
            </aside>
            <main
              className={`flex-1 overflow-x-auto transition-all duration-300`}
              style={
                sidebarHidden
                  ? {
                      width: "100vw",
                      maxWidth: "100vw",
                      paddingLeft: 80,
                      paddingRight: 32,
                      paddingTop: 32,
                      paddingBottom: 32,
                    }
                  : {
                      width: "calc(100vw - 220px)",
                      maxWidth: "calc(100vw - 50px)",
                      paddingLeft: 320,
                      paddingRight: 0,
                      paddingTop: 32,
                      paddingBottom: 32,
                    }
              }
            >
              {children}
            </main>
          </div>
        </UserContextProvider>
      </body>
    </html>
  );
}
