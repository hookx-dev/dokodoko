import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { columnArticles } from "@/lib/columnArticles";

export const metadata: Metadata = {
  title: "コラム - DokoDoko",
  description:
    "デートプランの立て方、友人との旅行計画のコツ、思い出の記録方法など、DokoDokoが役立つシーンにまつわる記事をまとめています。",
};

export default function ColumnIndexPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">コラム</h1>
          <p className="text-slate-600 dark:text-slate-400">
            デートプラン、旅行の計画、思い出の記録に役立つ記事をお届けします。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {columnArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/column/${article.slug}`}
              className="block bg-slate-50 dark:bg-zinc-900 rounded-2xl p-6 border border-slate-100 dark:border-zinc-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
                  {article.category}
                </span>
                <time dateTime={article.date}>{article.date}</time>
              </div>
              <h2 className="text-lg font-bold mb-2">{article.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {article.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
