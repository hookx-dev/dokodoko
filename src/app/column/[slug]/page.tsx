import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { columnArticles, getColumnArticle } from "@/lib/columnArticles";

export function generateStaticParams() {
  return columnArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const article = getColumnArticle(slug);
  if (!article) return {};

  return {
    title: `${article.title} - DokoDoko`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `/column/${article.slug}`,
      siteName: "DokoDoko",
      images: [{ url: "/ogp.jpg", width: 1200, height: 630, alt: "DokoDoko" }],
      locale: "ja_JP",
      type: "article",
    },
  };
}

export default function ColumnArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const article = getColumnArticle(slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-24 max-w-3xl mx-auto px-6 lg:px-8 w-full">
        <div className="mb-10">
          <Link
            href="/column"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← コラム一覧へ戻る
          </Link>
        </div>

        <article>
          <div className="flex items-center gap-3 mb-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
              {article.category}
            </span>
            <time dateTime={article.date}>{article.date}</time>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-6 leading-snug">
            {article.title}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-12 text-lg">
            {article.lead}
          </p>

          <div className="space-y-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold mb-4">{section.heading}</h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.list && (
                  <ul className="mt-4 space-y-2">
                    {section.list.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-slate-700 dark:text-slate-300 leading-relaxed"
                      >
                        <span className="text-indigo-500 shrink-0">・</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>

        <div className="my-14">
          <AdBanner type="horizontal" />
        </div>

        <div className="text-center bg-slate-50 dark:bg-zinc-900 rounded-3xl p-10 border border-slate-100 dark:border-zinc-800">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            気になる場所を地図にまとめて、大切な人と共有してみませんか？
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm transition-colors"
          >
            DokoDokoを無料で始める
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
