import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "よくある質問 - DokoDoko",
  description: "DokoDokoの使い方、料金、招待方法、写真アップロードなどよくある質問にお答えします。",
};

const faqs: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "はじめかた",
    items: [
      {
        q: "DokoDokoは無料で使えますか？",
        a: "はい、DokoDokoは完全無料でご利用いただけます。地図の作成数やピンの数に制限はありません。",
      },
      {
        q: "アカウント登録には何が必要ですか？",
        a: "Googleアカウントがあればすぐに始められます。メールアドレスとパスワードでの登録にも対応しています。面倒な入力は不要です。",
      },
      {
        q: "スマホアプリはありますか？",
        a: "ネイティブアプリはありませんが、ブラウザから「ホーム画面に追加」することでアプリのようにフルスクリーンで利用できます（PWA対応）。App StoreやGoogle Playからのインストールは不要です。",
      },
    ],
  },
  {
    category: "地図の作成・共有",
    items: [
      {
        q: "地図はいくつ作れますか？",
        a: "作成できる地図の数に上限はありません。パートナーとのデート用、友人との旅行用など、目的別に複数の地図を使い分けられます。",
      },
      {
        q: "友達やパートナーを地図に招待する方法は？",
        a: "地図の設定画面から招待リンクを発行できます。発行したURLをLINEやメッセージアプリで送るだけで、相手はリンクを開いてログインするだけで地図に参加できます。",
      },
      {
        q: "招待した相手が見られる範囲は？",
        a: "招待に参加したメンバー全員が、その地図上のピン・写真・メモを閲覧・編集できます。地図ごとにメンバーは独立しているため、他の地図の内容が見られることはありません。",
      },
      {
        q: "地図から退出したり、メンバーを削除したりできますか？",
        a: "はい。メンバー自身がいつでも地図から退出できるほか、地図の作成者（オーナー）はメンバーを削除することも可能です。",
      },
    ],
  },
  {
    category: "ピン・写真",
    items: [
      {
        q: "行きたい場所はどうやって登録しますか？",
        a: "地図上の検索バーから場所を検索し、選択するだけでピンが立ちます。「行きたい」「行った」のステータスを切り替えて管理できます。",
      },
      {
        q: "ピンに写真を追加できますか？",
        a: "はい。各ピンに複数の写真をアップロードできます。実際に訪れた際の写真を追加すれば、思い出の記録としても活用できます。不要になった写真は後から削除することも可能です。",
      },
      {
        q: "ピンのアイコンは変更できますか？",
        a: "カフェ、旅行、グルメなど、用途に合わせてピンのアイコンをカスタマイズできます。",
      },
    ],
  },
  {
    category: "アカウント・データ",
    items: [
      {
        q: "登録した情報は第三者に公開されますか？",
        a: "招待していない第三者が地図やピン情報を見ることはできません。詳しくはプライバシーポリシーをご確認ください。",
      },
      {
        q: "アカウントを削除したい場合は？",
        a: "お問い合わせフォームよりご連絡いただければ、アカウントおよび関連データの削除に対応いたします。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">よくある質問</h1>
          <p className="text-slate-600 dark:text-slate-400">
            DokoDokoの使い方について、よくいただくご質問をまとめました。
          </p>
        </div>

        <div className="space-y-14">
          {faqs.map((group) => (
            <section key={group.category}>
              <h2 className="text-xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">
                {group.category}
              </h2>
              <div className="space-y-6">
                {group.items.map((item) => (
                  <div
                    key={item.q}
                    className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-6 border border-slate-100 dark:border-zinc-800"
                  >
                    <h3 className="font-bold mb-2 flex gap-2">
                      <span className="text-indigo-500">Q.</span>
                      {item.q}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2">
                      <span className="text-slate-400 dark:text-slate-600 font-bold">A.</span>
                      <span>{item.a}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center bg-slate-50 dark:bg-zinc-900 rounded-3xl p-10 border border-slate-100 dark:border-zinc-800">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            解決しない疑問がある場合は、お気軽にお問い合わせください。
          </p>
          <a
            href="/contact"
            className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm transition-colors"
          >
            お問い合わせフォームへ
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
