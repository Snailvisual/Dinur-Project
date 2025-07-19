"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser");
      if (!user) {
        router.replace("/login");
      }
    }
  }, [router]);
  return (
    <div className="flex flex-col items-center justify-center pb-50 min-h-screen bg-[#f8f8f8] p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-300 text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-[#56ad9c] mb-4">Selamat Datang di Socialflow</h1>
        <p className="text-gray-700 mb-6">
          Socialflow adalah sebuah web application dashboard yang dirancang khusus untuk mempermudah proses perencanaan, pengelolaan, dan analisis konten di platform Instagram dan TikTok.
          Dengan fitur yang lengkap dan terintegrasi, Socialflow hadir sebagai solusi all-in-one bagi para social media specialist, content creator, agensi, maupun tim pemasaran brand dalam mengoptimalkan strategi media sosial mereka.
        </p>
        <p className="text-gray-700 mb-6">
          Dengan Socialflow, Anda dapat membuat rencana konten yang terstruktur, melakukan tracking terhadap KPI utama, hingga membaca insight performa konten secara visual dan mendalam. 
          Anda dapat memantau metrik penting seperti engagement rate, reach growth, performa konten harian hingga mingguan, serta membandingkan efektivitas antar campaign.
        </p>
        <p>
          Platform ini memungkinkan pengguna untuk membuat content plan yang terstruktur, melakukan tracking terhadap KPI utama, hingga membaca insight performa konten secara visual dan mendalam. Anda dapat memantau metrik penting seperti engagement rate, reach growth, performa konten harian hingga mingguan, serta membandingkan efektivitas antar campaign.
        </p>
        <p className="text-gray-700 mb-6">
          Tak hanya itu, Socialflow juga menyediakan fitur analisis performa yang berbasis data real-time, sehingga Anda dan tim dapat mengambil keputusan strategis secara cepat dan akurat. Dengan tampilan yang intuitif dan mudah digunakan, Socialflow cocok digunakan baik oleh pemula maupun profesional yang ingin bekerja lebih efisien dan berbasis data.
        </p>
        <div className="flex flex-col gap-4">
          <div className="bg-[#f3faf9] rounded-lg p-4 shadow-sm">
            <span className="font-semibold text-[#56ad9c]">Fitur Utama:</span>
            <ul className="list-disc list-inside text-left text-gray-600 mt-2 text-sm">
              <li>Dashboard insight Instagram & TikTok</li>
              <li>Content & editorial plan</li>
              <li>Analisa performa konten</li>
              <li>Target KPI & tracking</li>
              <li>Manajemen akun & tim</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}