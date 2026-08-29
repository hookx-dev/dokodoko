"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { FREE_PLAN_LIMITS, PREMIUM_PRICE_JPY } from "@/lib/plan";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function PricingPage() {
  const { user } = useAuth();
  const { plan } = usePlan();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleUpgradeClick = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      setIsRedirecting(true);
      const idToken = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!res.ok) throw new Error("Checkout session creation failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error(error);
      alert("決済ページの作成に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-24 max-w-5xl mx-auto px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">料金プラン</h1>
          <p className="text-slate-600 dark:text-slate-400">
            まずは無料で。もっと使いたくなったら、ワンコインでプレミアムに。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-1">フリープラン</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">まずはここから</p>
            <p className="text-4xl font-extrabold mb-6">
              ¥0<span className="text-base font-medium text-slate-500 dark:text-slate-400">/月</span>
            </p>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex gap-2">
                <span className="text-slate-400">・</span>
                地図は{FREE_PLAN_LIMITS.maxMaps}つまで作成可能
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">・</span>
                1つの地図に招待できるメンバーは{FREE_PLAN_LIMITS.maxMembersPerMap}人まで
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">・</span>
                「行きたい」ピンは同時に{FREE_PLAN_LIMITS.maxActiveWantToGoPins}件まで保持可能
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">・</span>
                「行きたい」ピンの新規追加は1日{FREE_PLAN_LIMITS.maxNewWantToGoPinsPerDay}件まで
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">・</span>
                「行った」ピンへの切り替え・写真アップロードは無制限
              </li>
            </ul>
            {plan === "free" && user && (
              <div className="mt-8 w-full text-center py-3 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold text-sm">
                現在のプラン
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div className="bg-indigo-600 rounded-3xl p-8 border border-indigo-600 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
            <div className="absolute top-4 right-4 bg-white/20 text-xs font-bold px-3 py-1 rounded-full">
              おすすめ
            </div>
            <h2 className="text-xl font-bold mb-1">プレミアムプラン</h2>
            <p className="text-indigo-100 text-sm mb-6">全部の機能を、無制限に</p>
            <p className="text-4xl font-extrabold mb-6">
              ¥{PREMIUM_PRICE_JPY}<span className="text-base font-medium text-indigo-100">/月</span>
            </p>
            <ul className="space-y-3 text-sm text-indigo-50">
              <li className="flex gap-2">
                <span>✓</span>
                地図をいくつでも作成可能
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                招待メンバー数の制限なし
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                「行きたい」ピンの保持数・新規追加数の制限なし
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                招待したメンバーも同じ地図では制限なしで利用可能
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                今後追加される機能もいち早く利用可能
              </li>
            </ul>
            {plan === "premium" ? (
              <div className="mt-8 w-full text-center py-3 rounded-xl bg-white/20 font-bold text-sm">
                現在のプラン
              </div>
            ) : (
              <button
                onClick={handleUpgradeClick}
                disabled={isRedirecting}
                className="mt-8 w-full py-3.5 rounded-xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors disabled:opacity-60"
              >
                {isRedirecting ? "処理中..." : "プレミアムにアップグレード"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-10">
          いつでもマイページの「アカウント設定」からキャンセルできます。決済はStripeを通じて安全に処理されます。
        </p>
      </main>

      <Footer />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
