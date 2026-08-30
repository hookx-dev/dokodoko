"use client";

import { useState } from "react";
import InfoModal, { InfoType } from "./InfoModal";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import AdBanner from "./AdBanner";
import { MapData, UserProfile, removeMemberFromMap } from "@/lib/firebase/firestore";

interface MenuDrawerProps {
  mapId: string;
  mapData?: MapData | null;
  userProfiles?: Record<string, UserProfile>;
  isOpen: boolean;
  onClose: () => void;
  onOpenList: (tab: "want_to_go" | "have_been") => void;
  onOpenRecent: () => void;
}

export default function MenuDrawer({ mapId, mapData, userProfiles, isOpen, onClose, onOpenList, onOpenRecent }: MenuDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [infoModalType, setInfoModalType] = useState<InfoType>(null);

  const router = useRouter();
  const { user } = useAuth();

  const handleLeaveMap = async () => {
    if (!user || !mapData) return;
    const confirm = window.confirm(`「${mapData.name}」から退出しますか？\n退出するとこの地図にアクセスできなくなります。`);
    if (!confirm) return;
    
    try {
      await removeMemberFromMap(mapId, user.uid, mapData.members || []);
      onClose();
      router.push("/dashboard");
    } catch (error) {
      console.error("Leave map error", error);
      alert("退出に失敗しました");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/join?id=${mapId}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts (e.g. local IP testing over http)
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
      {/* 背景の暗転 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[55]"
          onClick={onClose}
        />
      )}

      {/* ドロワー */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-zinc-900 z-[60] transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center hover:opacity-80 transition-opacity">
            <Image 
              src="/logo_full.png" 
              alt="DokoDoko Logo" 
              width={120} 
              height={34} 
              className="w-[120px] h-auto object-contain"
            />
          </Link>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {mapData && (
            <div className="px-4 py-3 mb-2">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">メンバー ({mapData.members?.length || 0}人)</h3>
              <div className="flex flex-wrap gap-2">
                {mapData.members?.map(uid => {
                  const profile = userProfiles?.[uid];
                  return (
                    <div key={uid} className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full py-1 pr-3 pl-1">
                      <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                            {(profile?.displayName || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[80px]">{profile?.displayName || "ユーザー"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-800 mx-4 mb-2"></div>

          <ul className="flex flex-col gap-1 px-2">
            
            <li>
              <Link 
                href="/dashboard"
                onClick={onClose}
                className="group w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200">ダッシュボードへ戻る</span>
              </Link>
            </li>

            <li>
              <button 
                onClick={() => {
                  onOpenList("want_to_go");
                  onClose();
                }}
                className="group w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200">いきたいとこ</span>
              </button>
            </li>

            <li>
              <button 
                onClick={() => {
                  onOpenList("have_been");
                  onClose();
                }}
                className="group w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l2 2 4-4" />
                </svg>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200">いったとこ</span>
              </button>
            </li>

            <li>
              <button 
                onClick={() => {
                  onOpenRecent();
                  onClose();
                }}
                className="group w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200">最近の検索</span>
              </button>
            </li>

          </ul>

          <div className="my-2 border-t border-gray-200 dark:border-gray-800 mx-4"></div>

          <ul className="flex flex-col gap-1 px-2">
            <li>
              <button 
                onClick={handleCopyLink}
                className="group w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-indigo-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <span className="font-medium text-sm text-gray-700 dark:text-gray-200">招待リンクをコピー</span>
                </div>
                {copied && (
                  <span className="text-xs font-bold text-white bg-green-500 dark:bg-green-600 px-3 py-1 rounded-full shadow-sm animate-pulse">
                    コピーしました！
                  </span>
                )}
              </button>
            </li>
          </ul>

          <div className="my-2 border-t border-gray-200 dark:border-gray-800 mx-4"></div>

          <ul className="flex flex-col gap-1 px-2">
            <li>
              <button 
                onClick={() => {
                  setInfoModalType("hints");
                  // onClose(); // keep drawer open or close it? usually better to keep or close, let's close drawer
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.496 1.509 1.333 1.509 2.316V18" />
                </svg>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200">使い方のヒント</span>
              </button>
            </li>

            <li>
              <button 
                onClick={() => {
                  setInfoModalType("help");
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200">ヘルプ</span>
              </button>
            </li>
          </ul>

          {user && (
            <>
              <div className="my-2 border-t border-gray-200 dark:border-gray-800 mx-4"></div>
              <ul className="flex flex-col gap-1 px-2 mb-4">
                <li>
                  <Link 
                    href="/settings"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">設定</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">料金プラン</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">よくある質問</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">お問い合わせ</span>
                  </Link>
                </li>
                {mapData && mapData.ownerId !== user.uid && (
                  <li>
                    <button 
                      onClick={handleLeaveMap}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500 group-hover:text-orange-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      <span className="font-medium text-sm text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300">この地図から退出する</span>
                    </button>
                  </li>
                )}
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span className="font-medium text-sm text-red-600 dark:text-red-400">ログアウト</span>
                  </button>
                </li>
              </ul>
            </>
          )}

          {/* 広告エリア（メニュー下部） */}
          <div className="mt-auto px-4 pb-6 pt-4">
            <AdBanner type="square" />
          </div>
        </nav>
      </div>

      {/* Info Modal */}
      <InfoModal 
        type={infoModalType} 
        onClose={() => setInfoModalType(null)} 
      />


    </>
  );
}
