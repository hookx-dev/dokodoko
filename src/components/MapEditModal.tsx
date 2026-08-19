"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { MapData, MapType, updateMap, deleteMap, removeMemberFromMap, getUsersProfiles, UserProfile } from "@/lib/firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface MapEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapData: MapData | null;
}

export default function MapEditModal({ isOpen, onClose, mapData }: MapEditModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<MapType>("personal");
  const [icon, setIcon] = useState("🗺️");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  const AVAILABLE_ICONS = [
    "🗺️", "🎢", "🎳", "🎮",
    "⛩️", "🗼", "🏯", "🗻",
    "🛍️", "🛒", "🏬", "🏪",
    "🍽️", "🍣", "🍔", "☕",
    "🍻", "🏨", "🏕️", "♨️",
    "🚗", "🚲", "❤️", "🌟"
  ];
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (mapData) {
      setName(mapData.name);
      setType(mapData.type);
      setIcon(mapData.icon || "🗺️");
      
      // メンバーのプロフィールを取得
      if (mapData.members && mapData.members.length > 0) {
        getUsersProfiles(mapData.members).then(profiles => {
          setUserProfiles(profiles);
        });
      }
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
        icon,
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

  const handleLeaveMap = async () => {
    if (!user) return;
    try {
      setIsSubmitting(true);
      await removeMemberFromMap(mapData.id, user.uid, mapData.members);
      onClose();
    } catch (error) {
      console.error(error);
      alert("地図からの退出に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/join?id=${mapData.id}`;
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
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all relative"
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
        ) : showConfirmLeave ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">パートナー連携を解除しますか？</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              「{mapData.name}」のメンバーからあなた自身を削除します。<br/>
              これ以降、あなたはこの地図にアクセスできなくなります。
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowConfirmLeave(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleLeaveMap}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md shadow-orange-500/20 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "解除中..." : "解除して退出する"}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  地図のアイコン
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`text-2xl py-2 rounded-xl border-2 transition-all ${icon === i ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-110' : 'border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 hover:scale-110'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  参加しているメンバー
                </label>
                <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-2">
                  {mapData.members?.map(uid => {
                    const profile = userProfiles[uid];
                    return (
                      <div key={uid} className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                            {profile?.photoURL ? (
                              <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 text-sm font-bold">
                                {(profile?.displayName || "ユ").charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {profile?.displayName || "名無しユーザー"}
                            {uid === user?.uid && <span className="ml-2 text-xs text-indigo-500 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">あなた</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })}
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

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmLeave(true)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl font-bold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                パートナー連携を解除する (退出)
              </button>
              
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
