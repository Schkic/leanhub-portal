import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Leanopedija Portal — Pametni Lean alati",
  description: "Upravljajte svojim Lean procesima, spremajte audite i pratite napredak.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />

        <main>
          {children}
        </main>

        <footer className="bg-white border-t border-[#e2e2e2] p-6 text-center text-xs text-[#9a9a9a] mt-12">
          <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-4">
              <a href="/uvjeti" className="hover:text-[#1a7a5e]">Uvjeti korištenja</a>
              <a href="/privatnost" className="hover:text-[#1a7a5e]">Politika privatnosti</a>
            </div>
            <div>© Leanopedija Portal — Izrađeno u Hrvatskoj 🇭🇷</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
