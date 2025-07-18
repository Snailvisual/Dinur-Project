"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserType = {
  name: string;
  email: string;
  photo: string;
  sidebarLogo?: string;
  appleId?: string;
  wa?: string;
  password?: string;
  passwordChanged?: boolean;
};

const defaultUser: UserType = {
  name: "Nama User",
  email: "user@email.com",
  photo: "https://ui-avatars.com/api/?name=Nama+User&background=56ad9c&color=fff",
  sidebarLogo: undefined,
  appleId: "appleiduser",
  wa: "",
  password: "",
  passwordChanged: false,
};

const UserContext = createContext<{
  user: UserType;
  setUser: (u: UserType) => void;
} | undefined>(undefined);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType>(defaultUser);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Prioritaskan currentUser, lalu profileUser, baru default
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          setUser({
            name: parsed.name || parsed.nama || defaultUser.name,
            email: parsed.email || defaultUser.email,
            photo: parsed.photo || defaultUser.photo,
            sidebarLogo: parsed.sidebarLogo || defaultUser.sidebarLogo,
            appleId: parsed.appleId || "",
            wa: parsed.wa || "",
            password: parsed.password || "",
            passwordChanged: parsed.passwordChanged || false,
          });
          return;
        } catch {}
      }
      // Jika tidak ada currentUser, cek profileUser
      const profileUser = localStorage.getItem("profileUser");
      if (profileUser) {
        try {
          const parsed = JSON.parse(profileUser);
          setUser({
            name: parsed.name || parsed.nama || defaultUser.name,
            email: parsed.email || defaultUser.email,
            photo: parsed.photo || defaultUser.photo,
            sidebarLogo: parsed.sidebarLogo || defaultUser.sidebarLogo,
            appleId: parsed.appleId || "",
            wa: parsed.wa || "",
            password: parsed.password || "",
            passwordChanged: parsed.passwordChanged || false,
          });
          return;
        } catch {}
      }
      // Jika tidak ada data sama sekali, gunakan default
      setUser(defaultUser);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserContextProvider");
  return ctx;
}
