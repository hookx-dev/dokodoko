import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 - DokoDoko",
  description: "DokoDokoプレミアムプランの販売に関する特定商取引法に基づく表記です。",
};

const rows: { label: string; value: string }[] = [
  { label: "販売事業者", value: "Hookx Dev（個人事業主）" },
  {
    label: "運営統括責任者",
    value: "請求があれば遅滞なく開示いたします。お問い合わせフォームよりご請求ください。",
  },
  {
    label: "所在地",
    value: "請求があれば遅滞なく開示いたします。お問い合わせフォームよりご請求ください。",
  },
  {
    label: "連絡先",
    value: "お問い合わせフォーム（/contact）よりご連絡ください。メールにて回答いたします。",
  },
  { label: "販売価格", value: "プレミアムプラン：月額500円（税込）。詳細は料金プランページをご確認ください。" },
  { label: "商品代金以外の必要料金", value: "インターネット接続にかかる通信料はお客様のご負担となります。" },
  {
    label: "お支払い方法",
    value: "クレジットカード決済（決済代行会社 Stripe, Inc. を利用）",
  },
  { label: "お支払い時期", value: "お申し込み時に初回課金、以降は毎月同日に自動更新・自動課金されます。" },
  { label: "サービス提供時期", value: "決済完了後、即時にプレミアムプランの機能がご利用いただけます。" },
  {
    label: "キャンセル・解約について",
    value:
      "アカウント設定ページよりいつでも解約可能です。解約すると、次回の請求は発生せず、当月の請求期間終了をもってフリープランに移行します。日割りでの返金は行っておりません。",
  },
  {
    label: "動作環境",
    value: "最新版のGoogle Chrome、Safari、Microsoft Edge等の主要なWebブラウザ（PC・スマートフォン対応）",
  },
];

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-6 lg:px-8 w-full">
        <h1 className="text-3xl font-bold mb-8">特定商取引法に基づく表記</h1>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 dark:border-zinc-800 last:border-b-0">
                  <th className="text-left align-top bg-slate-50 dark:bg-zinc-900 px-5 py-4 font-semibold w-40 whitespace-nowrap">
                    {row.label}
                  </th>
                  <td className="px-5 py-4 leading-relaxed text-slate-700 dark:text-slate-300">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          ご不明な点がございましたら、
          <a href="/contact" className="text-indigo-600 dark:text-indigo-400 underline">
            お問い合わせフォーム
          </a>
          よりご連絡ください。
        </p>
      </main>

      <Footer />
    </div>
  );
}
