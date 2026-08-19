import { Metadata } from "next";
import { Suspense } from "react";
import JoinMapClient from "./JoinMapClient";

export const metadata: Metadata = {
  title: "DokoDoko マップ招待",
  description: "プライベートマップアプリ「DokoDoko」で、一緒にお出かけスポットを共有しませんか？",
};

export default function JoinMapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <JoinMapClient />
    </Suspense>
  );
}
