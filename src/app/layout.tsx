import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp"
});

export const metadata: Metadata = {
  title: "SONGBOOK MAKER - 弾き語り向け歌本メーカー",
  description: "弾き語り向け A4サイズの歌詞＋コードネームが一体になった歌本メーカー",
  keywords: ["music", "chord", "songbook", "guitar", "piano"],
  authors: [{ name: "SONGBOOK MAKER" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SONGBOOK MAKER",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
