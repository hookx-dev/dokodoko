"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Map, { ViewStateChangeEvent, Marker, Popup, MapRef } from "react-map-gl/mapbox";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import { SearchBox } from "@mapbox/search-js-react";
import { subscribeToPins, Pin } from "@/lib/firebase/firestore";
import PinFormModal from "./PinFormModal";
import { useAuth } from "@/contexts/AuthContext";

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case "遊び": return "🎈";
    case "飲食店": return "🍽️";
    case "観光": return "📸";
    case "宿泊": return "🏨";
    case "ショッピング": return "🛍️";
    default: return "📍";
  }
};

interface MapComponentProps {
  mapId: string;
  targetLocation: { lat: number; lng: number; name?: string } | null;
  onCenterChange?: (lat: number, lng: number) => void;
}

interface SearchHistoryItem {
  name: string;
  address?: string;
  coords: [number, number];
}

export default function MapComponent({ mapId, targetLocation, onCenterChange }: MapComponentProps) {
  const { user } = useAuth();
  const mapRef = useRef<MapRef>(null);
  
  const [viewState, setViewState] = useState({
    longitude: 139.767, // Tokyo Station
    latitude: 35.6812,
    zoom: 12,
  });
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string; address?: string } | null>(null);
  const [temporaryPin, setTemporaryPin] = useState<{ lat: number; lng: number; name?: string; address?: string } | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("searchHistory");
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load search history", e);
    }
  }, []);

  const saveHistory = (name: string, address: string, coords: [number, number]) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.name !== name);
      const newHistory = [{ name, address, coords }, ...filtered].slice(0, 5);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleHistoryClick = (item: SearchHistoryItem) => {
    mapRef.current?.flyTo({
      center: item.coords,
      zoom: 15,
      duration: 1500
    });
    setTemporaryPin({ lat: item.coords[1], lng: item.coords[0], name: item.name, address: item.address });
    setShowHistory(false);
  };

  // Get active pin data from the latest pins array
  const activePin = pins.find(p => p.id === selectedPinId) || null;

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("お使いのブラウザは位置情報に対応していません");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          duration: 1500
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("位置情報の取得に失敗しました。端末の設定で位置情報へのアクセスが許可されているか確認してください。");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // targetLocationが変更されたら地図を移動
  useEffect(() => {
    if (targetLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [targetLocation.lng, targetLocation.lat],
        zoom: 15,
        duration: 1500
      });
      
      // 既存のピンかどうかチェック
      const existingPin = pins.find(
        p => p.latitude === targetLocation.lat && p.longitude === targetLocation.lng
      );
      
      if (existingPin) {
        setSelectedPinId(existingPin.id);
        setTemporaryPin(null);
      } else {
        setTemporaryPin(targetLocation);
        setSelectedPinId(null);
      }
    }
  }, [targetLocation, pins]);

  // ピンデータの取得
  useEffect(() => {
    const unsubscribe = subscribeToPins(mapId, (newPins) => {
      setPins(newPins);
    });
    return () => unsubscribe();
  }, [mapId]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const onMapLoad = useCallback((evt: any) => {
    const map = evt.target;
    const language = new MapboxLanguage({
      defaultLanguage: "ja",
    });
    map.addControl(language);

    // Initial load race condition fix: apply language to already loaded style
    const style = map.getStyle();
    if (style) {
      map.setStyle(language.setLanguage(style, 'ja'));
    }

    // SearchBox is rendered as a React component, no longer added as a map control in onMapLoad

  }, [mapboxToken]);

  const handleMapClick = (evt: any) => {
    // マーカークリック時などは地図自体のクリックイベントを発火させない
    if (evt.defaultPrevented) return;
    
    // ログインしていない場合はピンを立てられない
    if (!user) {
      alert("ピンを立てるにはログインしてください");
      return;
    }

    const { lng, lat } = evt.lngLat;
    setTemporaryPin({ lat, lng });
    setSelectedPinId(null);
  };


  if (!mapboxToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-center p-4">
        <p className="text-gray-500">
          Mapbox API Tokenが設定されていません。
          <br />
          .env.local ファイルに NEXT_PUBLIC_MAPBOX_TOKEN を設定してください。
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        onMoveEnd={(evt) => {
          if (onCenterChange) onCenterChange(evt.viewState.latitude, evt.viewState.longitude);
        }}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        cursor={user ? "pointer" : "grab"}
      >
        {/* SearchBoxを地図の左上に配置 */}
        <div 
          className="absolute top-2 left-2 z-10 w-[300px]"
          onFocus={() => setShowHistory(true)}
          onBlur={() => {
            // timeout allows the click event on the history item to fire before it unmounts
            setTimeout(() => setShowHistory(false), 200);
          }}
        >
          <SearchBox
            accessToken={mapboxToken}
            options={{ language: 'ja' }}
            placeholder="住所や店名を検索..."
            onRetrieve={(res) => {
              if (res && res.features && res.features.length > 0) {
                const feature = res.features[0] as any;
                const coords = feature.geometry.coordinates as [number, number];
                
                // save to history
                const name = feature.properties.name || feature.text || feature.properties.place_name || "不明な場所";
                const address = feature.properties.address || feature.place_name || feature.properties.place_name || "";
                saveHistory(name, address, coords);

                setTemporaryPin({ lat: coords[1], lng: coords[0], name, address });

                mapRef.current?.flyTo({
                  center: coords,
                  zoom: 15,
                  duration: 1500
                });
              }
            }}
          />
          
          {/* 検索履歴ドロップダウン */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 overflow-hidden z-20">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-50 dark:border-zinc-800">
                最近の検索
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {searchHistory.map((item, idx) => (
                  <li key={idx} className="border-b border-gray-50 dark:border-zinc-800/50 last:border-0">
                    <button
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-full text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate font-medium">{item.name}</span>
                        {item.address && (
                          <span className="block truncate text-xs text-gray-500 mt-0.5">{item.address}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 現在地ボタン */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute bottom-20 md:bottom-8 right-4 z-10 bg-white dark:bg-zinc-800 p-3.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center justify-center group"
          title="現在地に戻る"
        >
          {isLocating ? (
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          )}
        </button>

        {/* 現在地マーカー */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-50"></div>
              <div className="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
            </div>
          </Marker>
        )}

        {/* 仮のピン */}
        {temporaryPin && (
          <Marker
            longitude={temporaryPin.lng}
            latitude={temporaryPin.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(temporaryPin);
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform flex flex-col items-center animate-bounce-short">
              <div className="w-10 h-10 flex items-center justify-center rounded-full shadow-lg text-2xl border-4 bg-white border-yellow-400">
                📌
              </div>
              <div className="mt-1 bg-yellow-400 text-white px-2 py-1 rounded shadow-sm text-xs font-bold whitespace-nowrap">
                ここに追加
              </div>
            </div>
          </Marker>
        )}

        {/* ピンの描画 */}
        {pins.map((pin) => {
          if (typeof pin.longitude !== 'number' || typeof pin.latitude !== 'number') return null;
          return (
            <Marker
            key={pin.id}
            longitude={pin.longitude}
            latitude={pin.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedPinId(pin.id);
              setTemporaryPin(null);
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform flex flex-col items-center group">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md text-xl border-2 ${pin.status === 'have_been' ? 'bg-white border-red-500' : 'bg-white border-blue-500'}`}>
                {getCategoryEmoji(pin.category)}
              </div>
              <div className="mt-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-gray-800 border border-gray-200 whitespace-nowrap max-w-[120px] truncate text-center">
                {pin.title}
              </div>
            </div>
          </Marker>
          );
        })}

        {/* 選択されたピンのポップアップ情報 */}
        {activePin && (
          <Popup
            longitude={activePin.longitude}
            latitude={activePin.latitude}
            anchor="top"
            onClose={() => setSelectedPinId(null)}
            closeOnClick={false}
            className="z-20"
            maxWidth="300px"
          >
            <div className="p-1 text-black min-w-[200px] flex flex-col gap-2">
              {activePin.imageUrl && (
                <img 
                  src={activePin.imageUrl} 
                  alt={activePin.title} 
                  className="w-full h-32 object-cover rounded-md mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activePin.status === 'have_been' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {activePin.status === 'have_been' ? 'いった' : 'いきたい'}
                  </span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                    {activePin.category}
                  </span>
                </div>
                <h3 className="font-bold text-lg leading-tight">{activePin.title}</h3>
              </div>

              {activePin.address && (
                <p className="text-xs text-gray-500 break-all flex items-start gap-1">
                  📍 {activePin.address}
                </p>
              )}

              {activePin.url && (
                <a href={activePin.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all block">
                  🔗 リンクを開く
                </a>
              )}

              {activePin.memo && (
                <div className="bg-gray-50 p-2 rounded text-sm mt-1 whitespace-pre-wrap">
                  {activePin.memo}
                </div>
              )}

              <div className="text-[10px] text-gray-400 mt-2 border-t pt-2 flex flex-col gap-0.5">
                {activePin.status === 'have_been' && activePin.visitedAt && (
                  <span>訪問日: {activePin.visitedAt.toLocaleDateString('ja-JP')}</span>
                )}
                <span>登録者: {activePin.authorName}</span>
                <span>登録日: {activePin.createdAt.toLocaleDateString('ja-JP')}</span>
              </div>
              <button
                onClick={() => setEditingPin(activePin)}
                className="mt-2 w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                編集する
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* ピン追加/編集モーダル */}
      <PinFormModal 
        mapId={mapId}
        isOpen={selectedLocation !== null || editingPin !== null}
        onClose={() => {
          setSelectedLocation(null);
          setEditingPin(null);
          setTemporaryPin(null);
        }}
        latitude={editingPin ? editingPin.latitude : selectedLocation?.lat ?? null}
        longitude={editingPin ? editingPin.longitude : selectedLocation?.lng ?? null}
        initialTitle={selectedLocation?.name}
        initialAddress={selectedLocation?.address}
        existingPin={editingPin || undefined}
      />
    </div>
  );
}
