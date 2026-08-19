"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { getMap, MapData } from "@/lib/firebase/firestore";
import Header from "@/components/Header";
import MenuDrawer from "@/components/MenuDrawer";
import RecentListView from "@/components/RecentListView";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });
const PinListView = dynamic(() => import("@/components/PinListView"), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const params = useParams<{ mapId: string }>();
  const mapId = params?.mapId || "default";
  const { user, loading: authLoading } = useAuth();
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"want_to_go" | "have_been">("want_to_go");
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; name?: string; address?: string } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6812, lng: 139.767 });

  useEffect(() => {
    if (authLoading) return;
    
    const checkAccess = async () => {
      try {
        const data = await getMap(mapId);
        if (!data) {
          // 地図が存在しない場合トップへ
          router.push("/");
          return;
        }
        
        setMapData(data);
        
        // ログインしていない、またはメンバーではない場合は join ページへ飛ばす
        if (!user || !data.members.includes(user.uid)) {
          router.push(`/join/${mapId}`);
          return;
        }
        
        
      } catch (error) {
        console.error(error);
        router.push("/");
      }
    };
    checkAccess();
  }, [mapId, user, authLoading, router]);

  const handleOpenList = (tab: "want_to_go" | "have_been") => {
    setActiveTab(tab);
    setIsListOpen(true);
    setIsRecentOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleList = () => {
    setIsListOpen(!isListOpen);
    if (!isListOpen) setIsRecentOpen(false);
  };

  const toggleRecent = () => {
    setIsRecentOpen(!isRecentOpen);
    if (!isRecentOpen) setIsListOpen(false);
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-white dark:bg-black text-black dark:text-white">
      <div className="hidden md:block">
        <Header 
          title={mapData?.name || "マップ"} 
          type={mapData?.type} 
          memberCount={mapData?.members?.length} 
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        <aside className="
          z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-gray-200 dark:border-gray-800
          flex items-center
          fixed bottom-0 left-0 w-full h-16 flex-row justify-around border-t pb-safe
          md:relative md:w-20 md:h-full md:flex-col md:justify-start md:border-t-0 md:border-r md:py-4
        ">
          
          <div className="flex flex-row md:flex-col w-full h-full items-center justify-around md:justify-start md:gap-6 px-2 md:px-0">
            {/* Menu */}
            <button 
              onClick={toggleMenu}
              className="md:bg-white/90 md:dark:bg-zinc-900/90 md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-800 p-2 md:p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex flex-col items-center justify-center gap-1 group text-gray-500 dark:text-gray-400 w-16"
              title="メニュー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-6 md:h-6 group-hover:text-black dark:group-hover:text-white transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span className="text-[10px] font-semibold tracking-wider md:hidden whitespace-nowrap group-hover:text-black dark:group-hover:text-white">メニュー</span>
            </button>

            {/* List */}
            <button 
              onClick={toggleList}
              className="p-2 w-16 md:w-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors group flex flex-col items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              <span className="text-[10px] font-semibold tracking-wider whitespace-nowrap">リスト</span>
            </button>

            {/* Recent */}
            <button 
              onClick={toggleRecent}
              className="p-2 w-16 md:w-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors group flex flex-col items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-semibold tracking-wider whitespace-nowrap">最近</span>
            </button>

            {/* Spacer for desktop to push the next item to bottom */}
            <div className="hidden md:block flex-1"></div>

            {/* Back to Dashboard */}
            <button
              onClick={() => router.push("/dashboard")}
              className="md:bg-white/90 md:dark:bg-zinc-900/90 md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-800 p-2 md:p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center group w-16 md:w-auto md:mx-2 md:mt-auto"
              title="ダッシュボードに戻る"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:group-hover:-translate-x-1 group-hover:text-black dark:group-hover:text-white transition-all">
                <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-semibold tracking-wider md:hidden whitespace-nowrap group-hover:text-black dark:group-hover:text-white mt-1">戻る</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 relative w-full h-full overflow-hidden pb-16 md:pb-0">
          <MapComponent 
            mapId={mapId}
            targetLocation={targetLocation} 
            onCenterChange={(lat, lng) => setMapCenter({ lat, lng })}
          />
          
          <PinListView 
            mapId={mapId}
            isOpen={isListOpen} 
            onClose={() => setIsListOpen(false)} 
            onSelectPin={(lat, lng) => setTargetLocation({ lat, lng })}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mapCenter={mapCenter}
          />
          
          <MenuDrawer 
            mapId={mapId}
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            onOpenList={handleOpenList} 
            onOpenRecent={() => {
              setIsRecentOpen(true);
              setIsListOpen(false);
            }}
          />

          <RecentListView 
            isOpen={isRecentOpen} 
            onClose={() => setIsRecentOpen(false)} 
            onLocationSelect={(coords, name, address) => {
              setTargetLocation({ lat: coords[1], lng: coords[0], name, address });
            }}
          />
        </main>
      </div>
    </div>
  );
}
