import { Metadata } from "next";
import { Suspense } from "react";
import JoinMapClient from "./JoinMapClient";

const SITE_URL = "https://dokodoko.pages.dev";

const fallbackMetadata: Metadata = {
  title: "DokoDoko マップ招待",
  description: "プライベートマップアプリ「DokoDoko」で、一緒にお出かけスポットを共有しませんか？",
  robots: { index: false, follow: false },
};

interface FirestoreValue {
  stringValue?: string;
}

async function fetchDocFields(path: string): Promise<Record<string, FirestoreValue> | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { fields?: Record<string, FirestoreValue> };
    return data.fields ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const mapId = params?.id;
  if (!mapId) return fallbackMetadata;

  const mapFields = await fetchDocFields(`maps/${mapId}`);
  const name = mapFields?.name?.stringValue;
  if (!name) return fallbackMetadata;

  const icon = mapFields?.icon?.stringValue || "🗺️";
  const ownerId = mapFields?.ownerId?.stringValue;
  const ownerFields = ownerId ? await fetchDocFields(`users/${ownerId}`) : null;
  const ownerName = ownerFields?.displayName?.stringValue;

  const title = ownerName
    ? `${ownerName}さんから「${name}」に招待されました - DokoDoko`
    : `${icon} 「${name}」に招待されました - DokoDoko`;
  const description = `DokoDokoの共有マップ「${name}」に招待されています。行きたい場所・行った場所をみんなで記録しましょう。`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/join?id=${mapId}`,
      siteName: "DokoDoko",
      images: [{ url: `${SITE_URL}/ogp.jpg`, width: 1200, height: 630, alt: "DokoDoko" }],
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/ogp.jpg`],
    },
  };
}

export default function JoinMapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <JoinMapClient />
    </Suspense>
  );
}
