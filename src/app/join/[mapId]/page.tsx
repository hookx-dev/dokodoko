import { Metadata } from "next";
import { getMap } from "@/lib/firebase/firestore";
import JoinMapClient from "./JoinMapClient";

export async function generateMetadata({ params }: { params: Promise<{ mapId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const mapData = await getMap(resolvedParams.mapId);
    if (mapData) {
      return {
        title: `「${mapData.name}」へ招待されています | DokoDoko`,
        description: "DokoDokoを使ってマップに参加しましょう！",
        openGraph: {
          title: `「${mapData.name}」へ招待されています | DokoDoko`,
          description: "一緒にマップを作りましょう！",
          type: "website",
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  
  return {
    title: "DokoDoko マップ招待",
  };
}

export default function JoinMapPage() {
  return <JoinMapClient />;
}
