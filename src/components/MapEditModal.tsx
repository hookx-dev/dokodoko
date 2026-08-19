"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { MapData, MapType, updateMap, deleteMap } from "@/lib/firebase/firestore";

interface MapEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapData: MapData | null;
}

export default function MapEditModal({ isOpen, onClose, mapData }: MapEditModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<MapType>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (mapData) {
      setName(mapData.name);
      setType(mapData.type);
    }
  }, [mapData]);

  if (!isOpen || !mapData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await updateMap(mapData.id, {
        name: name.trim(),
        type,
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert("地図の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteMap(mapData.id);
      onClose();
    } catch (error) {
      console.error(error);
      alert("地図の削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/join/${mapData.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {showConfirmDelete ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">地図を削除しますか？</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              「{mapData.name}」と、そこに含まれるすべてのピンが削除されます。<br/>
              この操作は取り消すことができません。
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md shadow-red-500/20 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 pr-8">地図の設定</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  地図の名前
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="例：週末のお出かけスポット"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  地図の種類
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${type === 'personal' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
                    <input type="radio" className="hidden" checked={type === 'personal'} onChange={() => setType('personal')} />
                    <span className="text-2xl mb-1">🧭</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-300">個人用</span>
                  </label>
                  <label className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${type === 'partner' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
                    <input type="radio" className="hidden" checked={type === 'partner'} onChange={() => setType('partner')} />
                    <span className="text-2xl mb-1">❤️</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-300">パートナー</span>
                  </label>
                  <label className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${type === 'friends' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
                    <input type="radio" className="hidden" checked={type === 'friends'} onChange={() => setType('friends')} />
                    <span className="text-2xl mb-1">🍻</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-300">友達</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "保存中..." : "保存する"}
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  {copied ? "コピーしました！" : "招待リンクをコピー"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-4 border-t border-red-100 dark:border-red-900/30">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                この地図を削除する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
