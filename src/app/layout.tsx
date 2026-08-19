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
  metadataBase: new URL('http://localhost:3000'), // TODO: 本番公開時にドメインを変更
  title: 'DokoDoko - ふたりの思い出をひとつの地図に。',
  description: '一人旅の記録、友人との旅行計画、大切なパートナーとの共有。あなただけのプライベートな地図を作成しましょう。',
  openGraph: {
    title: 'DokoDoko - ふたりの思い出をひとつの地図に。',
    description: '一人旅の記録、友人との旅行計画、大切なパートナーとの共有。あなただけのプライベートな地図を作成しましょう。',
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
    title: 'DokoDoko - ふたりの思い出をひとつの地図に。',
    description: 'あなただけのプライベートな地図を作成し、特別な場所を記録しましょう。',
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
      </body>
    </html>
  );
}
