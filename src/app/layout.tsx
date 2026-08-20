import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DokoDoko',
  },
  metadataBase: new URL('https://dokodoko.pages.dev'),
  title: 'DokoDoko - カップルや友達と思い出の場所を共有するプライベートマップアプリ',
  description: 'カップルのデートプラン作りや友人との旅行計画に最適！一緒に行きたい場所や思い出のスポットをGoogleマップ上にピン留めしてリアルタイム共有できる、招待制の完全無料マップ作成アプリです。',
  openGraph: {
    title: 'DokoDoko - カップルや友達とつくる共有マップ',
    description: 'デートプランや旅行計画を地図で共有。行きたい場所や思い出のスポットをみんなでピン留めしよう！',
    url: '/',
    siteName: 'DokoDoko',
    images: [
      {
        url: '/ogp.jpg',
        width: 1200,
        height: 630,
        alt: 'DokoDoko OGP Image',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DokoDoko - カップルや友達とつくる共有マップ',
    description: 'デートプラン作りや旅行計画に。一緒に行きたい場所を地図にピン留めして共有しよう！',
    images: ['/ogp.jpg'],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Cloudflare Web Analytics */}
        <script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "75045c97a5d749208f05e0a3c711e036"}'
        />
      </body>
    </html>
  );
}
