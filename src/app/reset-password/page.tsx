"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/firebase/auth";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      setError("");
      await resetPassword(email);
      setIsSent(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("このメールアドレスは登録されていません。");
      } else if (err.code === "auth/invalid-email") {
        setError("メールアドレスの形式が正しくありません。");
      } else {
        setError("エラーが発生しました。時間をおいて再度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 opacity-100 dark:opacity-80" style={{ backgroundImage: "url('/images/abstract_map_bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-50/80 to-slate-100/90 dark:from-black/80 dark:to-zinc-900/90 backdrop-blur-[2px]"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl py-10 px-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/60 dark:border-zinc-700/50 rounded-3xl">
          <h2 className="text-center text-2xl font-extrabold text-slate-900 dark:text-white mb-8">
            パスワードの再設定
          </h2>

          {isSent ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100/80 dark:bg-green-900/50 mb-6 shadow-inner">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">メールを送信しました</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                パスワード再設定用のリンクを記載したメールを <br/>
                <strong className="text-slate-800 dark:text-slate-200">{email}</strong> 宛に送信しました。<br />
                メール内のリンクをクリックして新しいパスワードを設定してください。
              </p>
              <div className="mb-8 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-left">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  <span className="font-bold">⚠️ メールが届かない場合</span><br />
                  迷惑メールフォルダやプロモーションフォルダに自動的に振り分けられている可能性がありますので、そちらもご確認ください。
                </p>
              </div>
              <Link 
                href="/" 
                className="inline-block w-full py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all transform hover:-translate-y-0.5"
              >
                トップページに戻る
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                登録しているメールアドレスを入力してください。<br/>パスワード再設定用のリンクをお送りします。
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-zinc-700/80 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/90 dark:bg-zinc-800/90 dark:text-white transition-shadow"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50/80 dark:bg-red-900/20 p-3.5 rounded-xl font-medium border border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? "送信中..." : "再設定メールを送信"}
                </button>
              </div>

              <div className="text-center mt-6">
                <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                  ← ログイン画面に戻る
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
