"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMap, MapData } from "@/lib/firebase/firestore";
import { joinMap } from "@/lib/firebase/firestore";
import AuthModal from "@/components/AuthModal";

export default function JoinMapClient() {
  const searchParams = useSearchParams();
  const mapId = searchParams?.get("id");
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // 地図情報の取得
    const fetchMap = async () => {
      if (!mapId) return;
      try {
        const data = await getMap(mapId);
        if (data) {
          setMapData(data);
        } else {
          setErrorMsg("地図が見つかりません。URLが間違っているか、削除された可能性があります。");
        }
      } catch (err) {
        setErrorMsg("地図の取得中にエラーが発生しました。");
      }
    };
    fetchMap();
  }, [mapId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (mapData && !isJoining) {
      handleJoin();
    }
  }, [user, loading, mapData]);

  const handleJoin = async () => {
    if (!user || !mapData || !mapId) return;
    
    setIsJoining(true);
    try {
      // すでにメンバーかチェック
      if (mapData.members.includes(user.uid)) {
        router.push(`/map?id=${mapId}`);
        return;
      }

      await joinMap(mapId, user.uid);
      router.push(`/map?id=${mapId}`);
    } catch (error) {
      console.error(error);
      setErrorMsg("地図への参加に失敗しました。");
      setIsJoining(false);
    }
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">エラー</h2>
          <p className="text-slate-600 mb-6">{errorMsg}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold w-full"
          >
            トップページへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center animate-pulse">
        <div className="text-6xl mb-6">🗺️</div>
        <h1 className="text-2xl font-bold mb-2">
          {mapData ? `「${mapData.name}」へ参加しています...` : "地図情報を読み込み中..."}
        </h1>
        <p className="text-slate-500">しばらくお待ちください</p>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          // モーダルを閉じたら（ログインキャンセルしたら）トップへ
          if (!user) {
            router.push("/");
          }
          setIsAuthModalOpen(false);
        }} 
      />
    </div>
  );
}
