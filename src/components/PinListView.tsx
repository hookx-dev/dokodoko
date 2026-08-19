"use client";

import { useState, useEffect } from "react";
import { subscribeToPins, Pin, updatePin, deletePin } from "@/lib/firebase/firestore";
import PinForm from "./PinForm";

interface PinListViewProps {
  mapId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectPin: (lat: number, lng: number) => void;
  activeTab: "want_to_go" | "have_been";
  setActiveTab: (tab: "want_to_go" | "have_been") => void;
  mapCenter: { lat: number; lng: number };
}

export default function PinListView({ mapId, isOpen, onClose, onSelectPin, activeTab, setActiveTab, mapCenter }: PinListViewProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingPin, setViewingPin] = useState<Pin | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPrefecture, setFilterPrefecture] = useState<string>("all");

  // 都道府県を抽出するヘルパー
  const getPrefecture = (address: string | undefined) => {
    if (!address) return "未設定";
    const match = address.match(/(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)/);
    return match ? match[1] : "その他";
  };

  const [groupBy, setGroupBy] = useState<"category" | "prefecture" | "date">("category");

  // タブが切り替わったらデフォルトの並び替え・フィルターをリセット
  useEffect(() => {
    setGroupBy(activeTab === "want_to_go" ? "category" : "date");
    setFilterCategory("all");
    setFilterPrefecture("all");
  }, [activeTab]);

  useEffect(() => {
    if (!isOpen) {
      setIsAdding(false);
      setIsEditing(false);
      setViewingPin(null);
      return;
    }
    const unsubscribe = subscribeToPins(mapId, (data) => {
      setPins(data);
      // Update viewingPin if it was modified
      setViewingPin(prev => {
        if (!prev) return null;
        return data.find(p => p.id === prev.id) || null;
      });
    });
    return () => unsubscribe();
  }, [isOpen, mapId]);

  const handleMarkAsHaveBeen = async (pin: Pin) => {
    try {
      setIsUpdating(true);
      await updatePin(pin.id, {
        status: "have_been",
        visitedAt: new Date(),
      });
    } catch (error) {
      console.error(error);
      alert("更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteViewingPin = async () => {
    if (!viewingPin) return;
    if (window.confirm("この場所を削除してもよろしいですか？")) {
      try {
        setIsUpdating(true);
        await deletePin(viewingPin.id);
        setViewingPin(null);
      } catch (error) {
        console.error(error);
        alert("削除に失敗しました");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const tabPins = pins.filter(pin => pin.status === activeTab);
  const categories = Array.from(new Set(tabPins.map(p => p.category || "その他"))).sort();
  const prefectures = Array.from(new Set(tabPins.map(p => getPrefecture(p.address)))).filter(p => p !== "未設定").sort();

  const filteredPins = tabPins.filter(pin => {
    if (filterCategory !== "all" && (pin.category || "その他") !== filterCategory) return false;
    const pref = getPrefecture(pin.address);
    if (filterPrefecture !== "all" && pref !== filterPrefecture) return false;
    return true;
  });

  // 分類（グループ化）処理
  const groupedPins = () => {
    const groups: Record<string, Pin[]> = {};
    
    filteredPins.forEach(pin => {
      let key = "その他";
      
      if (groupBy === "category") {
        key = pin.category || "その他";
      } else if (groupBy === "prefecture") {
        key = getPrefecture(pin.address);
      } else if (groupBy === "date") {
        if (activeTab === "have_been") {
          if (pin.visitedAt) {
            key = `${pin.visitedAt.getFullYear()}年${pin.visitedAt.getMonth() + 1}月`;
          } else {
            key = "時期不明";
          }
        } else {
          key = `${pin.createdAt.getFullYear()}年${pin.createdAt.getMonth() + 1}月登録`;
        }
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(pin);
    });

    return Object.entries(groups).sort((a, b) => {
      if (groupBy === "date") {
        if (a[0].includes("不明")) return 1;
        if (b[0].includes("不明")) return -1;
        return b[0].localeCompare(a[0], 'ja'); // 降順 (新しい月が上)
      } else {
        if (a[0] === "その他" || a[0] === "未設定") return 1;
        if (b[0] === "その他" || b[0] === "未設定") return -1;
        return a[0].localeCompare(b[0], 'ja');
      }
    });
  };

  const groups = groupedPins();

  return (
    <>
      {/* 背景の暗転 */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/30 z-30"
          onClick={onClose}
        />
      )}

      {/* スライドパネル */}
      <div 
        className={`absolute top-0 left-0 h-full w-full bg-white dark:bg-zinc-900 z-40 transform transition-all duration-300 ease-in-out flex flex-col pb-[72px] md:pb-0 overflow-hidden ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"
        } ${isAdding || isEditing ? "md:w-[600px]" : "md:w-[400px]"}`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-zinc-900 flex-shrink-0">
          <h2 className="text-xl font-bold">
            {isAdding ? "場所を追加" : isEditing ? "場所を編集" : viewingPin ? "詳細" : "リスト"}
          </h2>
          <button 
            onClick={() => {
              if (isAdding) setIsAdding(false);
              else if (isEditing) setIsEditing(false);
              else if (viewingPin) setViewingPin(null);
              else onClose();
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            {viewingPin && !isAdding ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {isAdding || isEditing ? (
          <div className="flex-1 flex flex-col min-h-0">
            <PinForm 
              mapId={mapId}
              initialLat={isEditing && viewingPin ? viewingPin.latitude : mapCenter.lat}
              initialLng={isEditing && viewingPin ? viewingPin.longitude : mapCenter.lng}
              existingPin={isEditing && viewingPin ? viewingPin : undefined}
              onSuccess={() => {
                setIsAdding(false);
                setIsEditing(false);
              }}
              onCancel={() => {
                setIsAdding(false);
                setIsEditing(false);
              }}
            />
          </div>
        ) : viewingPin ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {viewingPin.imageUrl && (
                <img 
                  src={viewingPin.imageUrl} 
                  alt={viewingPin.title} 
                  className="w-full h-48 object-cover rounded-xl mb-2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              
              <div>
                <div className="flex gap-2 items-center mb-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${viewingPin.status === 'have_been' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {viewingPin.status === 'have_been' ? 'いった' : 'いきたい'}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full font-bold">
                    {viewingPin.category}
                  </span>
                </div>
                <h3 className="font-bold text-2xl leading-tight">{viewingPin.title}</h3>
              </div>

              {viewingPin.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all flex items-start gap-1">
                  📍 {viewingPin.address}
                </p>
              )}

              {viewingPin.url && (
                <a href={viewingPin.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all block">
                  🔗 リンクを開く
                </a>
              )}

              {viewingPin.memo && (
                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl text-sm mt-2 whitespace-pre-wrap border border-gray-100 dark:border-gray-800">
                  {viewingPin.memo}
                </div>
              )}

              <div className="text-xs text-gray-400 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-col gap-1">
                {viewingPin.status === 'have_been' && viewingPin.visitedAt && (
                  <span>訪問日: {viewingPin.visitedAt.toLocaleDateString('ja-JP')}</span>
                )}
                <span>登録者: {viewingPin.authorName}</span>
                <span>登録日: {viewingPin.createdAt.toLocaleDateString('ja-JP')}</span>
              </div>
            </div>

            {/* Action Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 flex-shrink-0 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex gap-2">
              
              <button
                onClick={handleDeleteViewingPin}
                disabled={isUpdating}
                className="p-3.5 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors border border-red-100 dark:border-red-900/50 disabled:opacity-50"
                title="削除する"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                disabled={isUpdating}
                className="p-3.5 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors border border-blue-100 dark:border-blue-900/50 disabled:opacity-50"
                title="編集する"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </button>

              <div className="flex-1">
                {viewingPin.status === 'want_to_go' ? (
                  <button
                    onClick={() => handleMarkAsHaveBeen(viewingPin)}
                    disabled={isUpdating}
                    className="w-full h-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {isUpdating ? "更新中..." : "いった！"}
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center gap-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-bold py-3.5 px-4 rounded-xl border border-green-200 dark:border-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                    訪問済み
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* タブ */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
              activeTab === "want_to_go" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("want_to_go")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === "want_to_go" ? 2 : 1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            いきたいとこ
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
              activeTab === "have_been" 
                ? "border-b-2 border-red-500 text-red-600" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("have_been")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === "have_been" ? 2 : 1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l2 2 4-4" />
            </svg>
            いったとこ
          </button>
        </div>

        {/* ツールバー (並び替え・絞り込み) */}
        <div className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-zinc-800/30">
          <button 
            onClick={() => {
              const el = document.getElementById('filter-panel');
              if (el) {
                el.classList.toggle('hidden');
                el.classList.toggle('flex');
              }
            }}
            className="md:hidden w-full px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              並び替え・絞り込み
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[10px] font-normal truncate max-w-[150px]">
                {groupBy === 'category' ? 'ジャンル順' : groupBy === 'prefecture' ? '都道府県順' : '時期順'}
                {filterCategory !== 'all' && `・${filterCategory}`}
                {filterPrefecture !== 'all' && `・${filterPrefecture}`}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
          
          <div id="filter-panel" className="hidden md:flex px-4 pb-3 pt-2 md:py-3 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap min-w-[40px]">並び替え</span>
                <select 
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                  className="text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 dark:text-gray-200 cursor-pointer shadow-sm min-w-fit"
                >
                  <option value="category">ジャンルごと</option>
                  <option value="prefecture">都道府県ごと</option>
                  <option value="date">{activeTab === "have_been" ? "訪問月順" : "登録月順"}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap min-w-[40px]">絞り込み</span>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 dark:text-gray-200 cursor-pointer shadow-sm min-w-fit"
                >
                  <option value="all">すべてのジャンル</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                  value={filterPrefecture}
                  onChange={(e) => setFilterPrefecture(e.target.value)}
                  className="text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 dark:text-gray-200 cursor-pointer shadow-sm min-w-fit"
                >
                  <option value="all">すべての都道府県</option>
                  {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {(filterCategory !== "all" || filterPrefecture !== "all" || groupBy !== (activeTab === "want_to_go" ? "category" : "date")) && (
                <button
                  onClick={() => {
                    setGroupBy(activeTab === "want_to_go" ? "category" : "date");
                    setFilterCategory("all");
                    setFilterPrefecture("all");
                  }}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                >
                  リセット
                </button>
              )}
            </div>
          </div>
        </div>

        {/* リスト内容 */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {filteredPins.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              まだ登録されていません
            </div>
          ) : (
            groups.map(([groupName, groupPins]) => (
              <div key={groupName} className="flex flex-col gap-3">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm py-1.5 z-10 border-b border-gray-100 dark:border-gray-800">
                  {groupName} <span className="text-xs font-normal text-gray-400 ml-2">({groupPins.length})</span>
                </h3>
                <div className="flex flex-col gap-3">
                  {groupPins.map(pin => (
                    <button
                      key={pin.id}
                      onClick={() => {
                        onSelectPin(pin.latitude, pin.longitude);
                        setViewingPin(pin);
                      }}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex gap-3 shadow-sm hover:shadow-md"
                    >
                      {pin.imageUrl ? (
                        <img 
                          src={pin.imageUrl} 
                          alt={pin.title} 
                          className="w-20 h-20 object-cover rounded bg-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded flex items-center justify-center flex-shrink-0 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{pin.title}</h4>
                        </div>
                        {pin.address && (
                          <p className="text-xs text-gray-500 truncate mt-1">{pin.address}</p>
                        )}
                        <div className="text-[10px] text-gray-400 mt-2">
                          {pin.status === 'have_been' && pin.visitedAt ? (
                            <span>{pin.visitedAt.toLocaleDateString('ja-JP')} 訪問</span>
                          ) : (
                            <span>{pin.createdAt.toLocaleDateString('ja-JP')} 登録</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 場所を追加ボタン (下部に固定) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 flex-shrink-0 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新しい場所を追加
          </button>
        </div>


          </>
        )}
      </div>
    </>
  );
}
