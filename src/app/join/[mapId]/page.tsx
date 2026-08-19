import { Metadata } from "next";
import { getMap } from "@/lib/firebase/firestore";
import JoinMapClient from "./JoinMapClient";

export async function generateMetadata({ params }: { params: Promise<{ mapId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const mapData = await getMap(resolvedParams.mapId);
    if (mapData) {
      const mapIcon = mapData.icon || "🗺️";
      return {
        title: `${mapIcon}「${mapData.name}」への招待 | DokoDoko`,
        description: `DokoDokoで共有マップに参加して、一緒にお出かけの記録や計画を立てましょう！`,
        openGraph: {
          title: `${mapIcon}「${mapData.name}」への招待が届いています`,
          description: `プライベートマップアプリ「DokoDoko」で、一緒にお出かけスポットを共有しませんか？`,
          type: "website",
          images: ["/ogp.jpg"],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${mapIcon}「${mapData.name}」への招待`,
          description: `プライベートマップアプリ「DokoDoko」で、一緒にお出かけスポットを共有しませんか？`,
          images: ["/ogp.jpg"],
        }
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
