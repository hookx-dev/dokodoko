import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center px-6 py-32 text-center">
        <div>
          <div className="text-7xl mb-6">🗺️</div>
          <h1 className="text-3xl font-bold mb-4">ページが見つかりません</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
            お探しのページは移動または削除された可能性があります。<br />
            URLをご確認いただくか、トップページからやり直してください。
          </p>
          <Link
            href="/"
            className="inline-flex px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-md shadow-indigo-500/20 transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
