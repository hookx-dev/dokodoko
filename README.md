# DokoDoko

カップルや友人同士で「行きたい場所」「思い出の場所」を地図上にピン留めし、招待制でリアルタイム共有できるプライベートマップアプリです。

🔗 https://dokodoko.pages.dev

## 主な機能

- 招待リンクによるプライベートマップの作成・参加
- 地図上へのピン登録（住所検索・写真添付・メモ付き）
- メンバー間でのリアルタイム共有
- 有料プラン（Stripeによるサブスクリプション課金）
- PWA対応（ホーム画面への追加・オフライン一部対応）

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) / React 19 / TypeScript
- **地図**: Mapbox GL JS (`react-map-gl`, `@mapbox/search-js-react`)
- **認証・データベース**: Firebase (Authentication / Firestore)
- **決済**: Stripe
- **画像ストレージ**: Cloudflare R2 (`@aws-sdk/client-s3` 経由のS3互換API)
- **メール送信**: Resend
- **スタイリング**: Tailwind CSS 4
- **デプロイ**: Cloudflare Pages (`@cloudflare/next-on-pages`)

## セットアップ

```bash
npm install
cp .env.local.example .env.local  # 各種APIキーを設定
npm run dev
```

http://localhost:3000 で確認できます。

### 必要な環境変数

`.env.local` に以下を設定してください（値は各サービスのダッシュボードから取得）。

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Authentication / Firestore 接続（クライアント） |
| `FIREBASE_PROJECT_ID` / `FIREBASE_SERVICE_ACCOUNT_*` | Firebase Admin（サーバーサイドAPI） |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox地図の表示・住所検索 |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` | 決済（サブスクリプション） |
| `CLOUDFLARE_ACCOUNT_ID` / `R2_*` | 画像アップロード先（Cloudflare R2） |
| `RESEND_API_KEY` / `CONTACT_RECIPIENT_EMAIL` | お問い合わせメールの送信 |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | お問い合わせフォーム送信（Web3Forms） |
| `NEXT_PUBLIC_SITE_URL` | Stripe決済後のリダイレクト先URL生成 |
| `NEXT_PUBLIC_ADMIN_EMAILS` | 広告非表示アカウントの判定 |

詳細は [`.env.local.example`](.env.local.example) を参照してください。

### Firestore Security Rules

`firestore.rules` にプラン・課金情報などクライアントから書き込み不可のルールを定義しています。デプロイ時は以下を実行してください。

```bash
firebase deploy --only firestore:rules --project <FIREBASE_PROJECT_ID>
```

## ビルド

```bash
npm run build
```

Cloudflare Pages 向けビルドは `@cloudflare/next-on-pages` を使用しています。
