"use client";

import { useAuth } from "@/contexts/AuthContext";

interface AdBannerProps {
  type?: "horizontal" | "square";
  className?: string;
}

export default function AdBanner({ type = "horizontal", className = "" }: AdBannerProps) {
  const { user } = useAuth();

  // 広告を非表示にする管理者メールアドレスのリスト
  // 本番環境では .env.local に NEXT_PUBLIC_ADMIN_EMAILS=admin@test.com,owner@test.com のように設定します
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(",").map(e => e.trim())
    : []; // 開発中に追加したい場合はここに ["youremail@example.com"] を追加してもOK

  // ログインしており、かつ管理者の場合は何も表示しない
  if (user && user.email && adminEmails.includes(user.email)) {
    return null;
  }

  // --- 以降はプレースホルダー（後日ASPのコードに差し替える） ---
  const isHorizontal = type === "horizontal";

  return (
    <div 
      className={`bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 rounded-xl overflow-hidden ${
        isHorizontal ? "w-full min-h-[100px] sm:min-h-[120px]" : "w-full aspect-square max-w-[300px] mx-auto"
      } ${className}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Advertisement</span>
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span className="font-medium text-sm">スポンサー広告枠</span>
      </div>
      <p className="text-[10px] mt-1 opacity-70 text-center px-4">
        ※ここにアフィリエイトバナーを設置します
      </p>
    </div>
  );
}
