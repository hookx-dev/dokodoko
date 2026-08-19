"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToUserMaps, MapData, createMap, MapType } from "@/lib/firebase/firestore";
import Header from "@/components/Header";
import MapEditModal from "@/components/MapEditModal";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [maps, setMaps] = useState<MapData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newMapName, setNewMapName] = useState("");
  const [newMapType, setNewMapType] = useState<MapType>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMap, setEditingMap] = useState<MapData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserMaps(user.uid, (data) => {
      setMaps(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMapName.trim()) return;

    try {
      setIsSubmitting(true);
      const mapId = await createMap({
        name: newMapName.trim(),
        type: newMapType,
        members: [user.uid],
        ownerId: user.uid,
      });
      setIsCreating(false);
      setNewMapName("");
      // Redirect to the new map
      router.push(`/map/${mapId}`);
    } catch (error) {
      console.error(error);
      alert("地図の作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, map: MapData) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingMap(map);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getTypeIcon = (type: MapType) => {
    switch(type) {
      case "personal": return "🧭";
      case "partner": return "❤️";
      case "friends": return "🍻";
      default: return "🗺️";
    }
  };

  const getTypeName = (type: MapType) => {
    switch(type) {
      case "personal": return "個人用";
      case "partner": return "パートナー";
      case "friends": return "友達・グループ";
      default: return "その他";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white font-sans">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">マイページ</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">あなたの地図一覧</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-md shadow-indigo-500/20 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>+</span> 新しい地図を作る
          </button>
        </div>

        {maps.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-zinc-800 shadow-sm">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2">まだ地図がありません</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              右上のボタンから新しい地図を作成して、思い出の場所を記録し始めましょう。
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              最初の地図を作る
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <Link 
                href={`/map/${map.id}`} 
                key={map.id}
                className="group block bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {getTypeIcon(map.type)}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-full">
                    {getTypeName(map.type)}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {map.name}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 5.963-2.06.438-.398.81-.84.41-1.412A11.98 11.98 0 0010 12a11.98 11.98 0 00-6.535 2.493z" />
                    </svg>
                    <span>メンバー {map.members?.length || 1}人</span>
                  </div>
                  
                  {map.ownerId === user.uid && (
                    <button
                      onClick={(e) => handleEditClick(e, map)}
                      className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2 rounded-full transition-colors"
                      title="地図の設定"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <MapEditModal
        isOpen={!!editingMap}
        onClose={() => setEditingMap(null)}
        mapData={editingMap}
      />

      {/* 新規作成モーダル */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 rounded-full"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-6">新しい地図を作成</h2>
            <form onSubmit={handleCreateMap} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">地図の名前</label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="例：太郎と花子のマップ"
                  required
                  className="w-full border-2 border-slate-200 dark:border-zinc-700 rounded-xl p-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">地図の種類</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${newMapType === 'personal' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-zinc-700 hover:border-indigo-300'}`}>
                    <input type="radio" className="hidden" checked={newMapType === 'personal'} onChange={() => setNewMapType('personal')} />
                    <span className="text-2xl">🧭</span>
                    <span className="text-xs font-bold">個人用</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${newMapType === 'partner' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-zinc-700 hover:border-indigo-300'}`}>
                    <input type="radio" className="hidden" checked={newMapType === 'partner'} onChange={() => setNewMapType('partner')} />
                    <span className="text-2xl">❤️</span>
                    <span className="text-xs font-bold">パートナー</span>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${newMapType === 'friends' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-zinc-700 hover:border-indigo-300'}`}>
                    <input type="radio" className="hidden" checked={newMapType === 'friends'} onChange={() => setNewMapType('friends')} />
                    <span className="text-2xl">🍻</span>
                    <span className="text-xs font-bold">友達</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newMapName.trim()}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-indigo-500/20"
              >
                {isSubmitting ? "作成中..." : "作成する"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
