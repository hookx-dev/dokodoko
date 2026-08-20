"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Status = "idle" | "loading" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "送信に失敗しました");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("ネットワークエラーが発生しました");
      setStatus("error");
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.subject.trim() &&
    formData.message.trim();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/30 dark:via-black dark:to-blue-950/20" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-16 text-center">
            {/* 戻るボタン */}
            <div className="flex justify-start mb-6">
              <button
                id="contact-back-btn"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors group"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                戻る
              </button>
            </div>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              お問い合わせ
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              ご質問・ご要望・バグ報告など、お気軽にお送りください。
              内容を確認後、できる限り迅速にご対応いたします。
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto px-6 lg:px-8 mt-4">

          {/* 送信成功 */}
          {status === "success" ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-zinc-800 p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/10 mb-6">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                送信完了しました！
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                お問い合わせいただきありがとうございます。<br />
                通常 2〜3 営業日以内にご返信いたします。
              </p>
              <button
                id="contact-back-to-top-btn"
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                トップページへ戻る
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-zinc-800 p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6" id="contact-form">

                {/* エラー表示 */}
                {status === "error" && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                  </div>
                )}

                {/* 名前 */}
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    お名前 <span className="text-indigo-500">*</span>
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusedField === "name"
                      ? "border-indigo-500 ring-3 ring-indigo-500/20"
                      : "border-slate-200 dark:border-zinc-700"
                  }`}>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="山田 太郎"
                      className="w-full bg-transparent px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl outline-none text-sm"
                    />
                  </div>
                </div>

                {/* メールアドレス */}
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    メールアドレス <span className="text-indigo-500">*</span>
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusedField === "email"
                      ? "border-indigo-500 ring-3 ring-indigo-500/20"
                      : "border-slate-200 dark:border-zinc-700"
                  }`}>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="example@email.com"
                      className="w-full bg-transparent px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl outline-none text-sm"
                    />
                  </div>
                </div>

                {/* 件名 */}
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    件名 <span className="text-indigo-500">*</span>
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusedField === "subject"
                      ? "border-indigo-500 ring-3 ring-indigo-500/20"
                      : "border-slate-200 dark:border-zinc-700"
                  }`}>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="お問い合わせの件名を入力してください"
                      className="w-full bg-transparent px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl outline-none text-sm"
                    />
                  </div>
                </div>

                {/* お問い合わせ内容 */}
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    お問い合わせ内容 <span className="text-indigo-500">*</span>
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    focusedField === "message"
                      ? "border-indigo-500 ring-3 ring-indigo-500/20"
                      : "border-slate-200 dark:border-zinc-700"
                  }`}>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="お問い合わせ内容を詳しくご記入ください"
                      className="w-full bg-transparent px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl outline-none text-sm resize-none"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-600 text-right">
                    {formData.message.length} 文字
                  </p>
                </div>

                {/* 送信ボタン */}
                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={!isFormValid || status === "loading"}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 disabled:shadow-none"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>送信中...</span>
                    </>
                  ) : (
                    <>
                      <span>送信する</span>
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Info Cards */}
          {status !== "success" && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">返信について</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    通常 2〜3 営業日以内にご返信いたします
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">個人情報の取り扱い</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    入力情報はお問い合わせ対応のみに使用します
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
