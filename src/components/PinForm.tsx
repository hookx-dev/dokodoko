"use client";
/* eslint-disable react-hooks/exhaustive-deps, @next/next/no-img-element */

import { useState, useEffect } from "react";
import { addPin, updatePin, deletePin, PinStatus, PinCategory, Pin, getMap, getUserPlan, getWantToGoPinStats } from "@/lib/firebase/firestore";
import { uploadPinImage } from "@/lib/cloudflare/r2";
import { useAuth } from "@/contexts/AuthContext";
import { canAddWantToGoPin, FREE_PLAN_LIMITS } from "@/lib/plan";
import { useRouter } from "next/navigation";
import { SearchBox } from "@mapbox/search-js-react";

interface PinFormProps {
  mapId: string;
  initialLat: number | null;
  initialLng: number | null;
  initialTitle?: string;
  initialAddress?: string;
  existingPin?: Pin;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinForm({ mapId, initialLat, initialLng, initialTitle, initialAddress, existingPin, onSuccess, onCancel }: PinFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  // State for all fields
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<PinStatus>("want_to_go");
  const [category, setCategory] = useState<PinCategory>("遊び");
  const [address, setAddress] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [visitedAt, setVisitedAt] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [internalLat, setInternalLat] = useState<number | null>(null);
  const [internalLng, setInternalLng] = useState<number | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Initialize from existingPin or initial coordinates
  useEffect(() => {
    if (existingPin) {
      setTitle(existingPin.title);
      setStatus(existingPin.status);
      setCategory(existingPin.category);
      setAddress(existingPin.address || "");
      setUrl(existingPin.url || "");
      setImageUrl(existingPin.imageUrl || "");
      if (existingPin.visitedAt) {
        const d = existingPin.visitedAt;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setVisitedAt(`${yyyy}-${mm}-${dd}`);
      } else {
        setVisitedAt("");
      }
      setMemo(existingPin.memo || "");
      setInternalLat(existingPin.latitude);
      setInternalLng(existingPin.longitude);
    } else {
      // Initialize with default empty values when creating new pin
      setTitle(initialTitle || "");
      setStatus("want_to_go");
      setCategory("遊び");
      setAddress(initialAddress || "");
      setUrl("");
      setImageUrl("");
      setVisitedAt("");
      setMemo("");
      setInternalLat(initialLat);
      setInternalLng(initialLng);
    }
  }, [initialLat, initialLng, existingPin, initialTitle, initialAddress]);

  const handleStatusChange = (newStatus: PinStatus) => {
    setStatus(newStatus);
    if (newStatus === "have_been" && !visitedAt) {
      const today = new Date();
      // YYYY-MM-DD
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setVisitedAt(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("ログインしてください");
      return;
    }
    
    // Use fallback map center if lat/lng are still null (happens if manual entry from sidebar without map click)
    // Wait, initialLat and initialLng are provided from mapCenter.
    // If they are strictly null, we can't save.
    if (internalLat === null || internalLng === null) {
      alert("場所の位置情報（緯度経度）が取得できませんでした。検索から選択するか、地図から再度お試しください。");
      return;
    }

    // 無料プランの「行きたい」ピン上限チェック（新規追加のみ対象）
    if (!existingPin && status === "want_to_go") {
      try {
        const mapData = await getMap(mapId);
        if (mapData) {
          const ownerPlan = await getUserPlan(mapData.ownerId);
          const { activeCount, addedTodayCount } = await getWantToGoPinStats(mapId);
          const result = canAddWantToGoPin(ownerPlan, activeCount, addedTodayCount);
          if (!result.allowed) {
            const message =
              result.reason === "daily_limit"
                ? `無料プランでは「行きたい」の新規追加は1日${FREE_PLAN_LIMITS.maxNewWantToGoPinsPerDay}件までです。プレミアムプランなら無制限に追加できます。`
                : `無料プランでは「行きたい」を同時に${FREE_PLAN_LIMITS.maxActiveWantToGoPins}件までしか保持できません。プレミアムプランなら無制限に保持できます。`;
            if (window.confirm(`${message}\n\nプラン一覧を見ますか？`)) {
              router.push("/pricing");
            }
            return;
          }
        }
      } catch (error) {
        console.error("Failed to check plan limits", error);
      }
    }

    try {
      setLoading(true);
      
      let finalImageUrl = imageUrl;
      if (imageFile) {
        try {
          finalImageUrl = await uploadPinImage(imageFile, (progress) => {
            setUploadProgress(progress);
          });
        } catch (error) {
          console.error("Image upload failed", error);
          alert("画像のアップロードに失敗しました。ファイルサイズや通信状況をご確認ください。");
          setLoading(false);
          setUploadProgress(0);
          return;
        }
      }

      const authorName = user.displayName || user.email?.split("@")[0] || "ゲスト";
      
      const pinData: Partial<Pin> = {
        mapId,
        title: title.trim() || address.trim() || "名称未設定の場所",
        status,
        category,
        latitude: internalLat,
        longitude: internalLng,
        authorId: user.uid,
        authorName,
      };

      if (address) pinData.address = address;
      else if (existingPin) pinData.address = null as unknown as undefined; // Clear field if deleted

      if (url) pinData.url = url;
      else if (existingPin) pinData.url = null as unknown as undefined;

      if (finalImageUrl) pinData.imageUrl = finalImageUrl;
      else if (existingPin) pinData.imageUrl = null as unknown as undefined;

      if (status === "have_been" && visitedAt) pinData.visitedAt = new Date(visitedAt);
      else if (existingPin) pinData.visitedAt = null as unknown as undefined;

      if (memo) pinData.memo = memo;
      else if (existingPin) pinData.memo = null as unknown as undefined;

      if (existingPin) {
        await updatePin(existingPin.id, pinData);
      } else {
        await addPin(pinData as Omit<Pin, "id" | "createdAt">);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("ピンの保存に失敗しました");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!existingPin) return;
    if (window.confirm("この場所を削除してもよろしいですか？")) {
      try {
        setLoading(true);
        await deletePin(existingPin.id);
        onSuccess();
      } catch (error) {
        console.error(error);
        alert("削除に失敗しました");
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <form id="pin-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 検索機能 (自動入力) */}
          {mapboxToken && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <label className="block text-sm font-bold mb-2 text-blue-800 dark:text-blue-300">🔍 場所を検索して自動入力</label>
              <div className="search-box-container relative z-[90]">
                <SearchBox
                  accessToken={mapboxToken}
                  options={{ language: 'ja' }}
                  placeholder="施設名や住所を入力..."
                  onRetrieve={(res) => {
                    if (res && res.features && res.features.length > 0) {
                      const feature = res.features[0];
                      // title
                      if (feature.properties.name) setTitle(feature.properties.name);
                      // address
                      if (feature.properties.full_address) setAddress(feature.properties.full_address);
                      else if (feature.properties.place_formatted) setAddress(feature.properties.place_formatted);
                      // coordinates
                      if (feature.geometry && feature.geometry.coordinates) {
                        setInternalLng(feature.geometry.coordinates[0]);
                        setInternalLat(feature.geometry.coordinates[1]);
                      }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">※検索すると下の入力欄と地図上のピンの位置が自動的に反映されます。</p>
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ステータス</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={status === "want_to_go"} onChange={() => handleStatusChange("want_to_go")} className="w-4 h-4 text-blue-600" />
                <span className="text-black dark:text-white">いきたい</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={status === "have_been"} onChange={() => handleStatusChange("have_been")} className="w-4 h-4 text-blue-600" />
                <span className="text-black dark:text-white">いった</span>
              </label>
            </div>
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">カテゴリ</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as PinCategory)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["遊び", "飲食店", "観光", "宿泊", "ショッピング", "その他"].map(c => (
                <option key={c} value={c} className="text-gray-900 dark:text-gray-100">{c}</option>
              ))}
            </select>
          </div>

          {/* いった日 */}
          {status === "have_been" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">いった日</label>
              <input
                type="date"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* 店名/タイトル */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">店名・スポット名（任意）</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 初デートで行ったカフェ（空欄可）"
            />
          </div>

          {/* 住所 */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">住所</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="東京都渋谷区..."
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL（食べログや公式サイトなど）</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="楽しかった思い出や、次行きたい理由など"
            />
          </div>
          
          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">写真を追加</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const file = e.target.files[0];
                  
                  // 画像のリサイズ・圧縮処理
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement("canvas");
                      const MAX_SIZE = 1000;
                      let width = img.width;
                      let height = img.height;

                      if (width > height) {
                        if (width > MAX_SIZE) {
                          height *= MAX_SIZE / width;
                          width = MAX_SIZE;
                        }
                      } else {
                        if (height > MAX_SIZE) {
                          width *= MAX_SIZE / height;
                          height = MAX_SIZE;
                        }
                      }

                      canvas.width = width;
                      canvas.height = height;
                      const ctx = canvas.getContext("2d");
                      ctx?.drawImage(img, 0, 0, width, height);

                      canvas.toBlob(
                        (blob) => {
                          if (blob) {
                            const compressedFile = new File([blob], file.name, {
                              type: "image/jpeg",
                              lastModified: Date.now(),
                            });
                            setImageFile(compressedFile);
                            setImageUrl(""); // Clear URL input when file is selected
                          }
                        },
                        "image/jpeg",
                        0.8 // 品質80%
                      );
                    };
                    if (event.target?.result) {
                      img.src = event.target.result as string;
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/30 dark:file:text-blue-400
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                cursor-pointer"
            />
            {(imageFile || imageUrl) && (
              <div className="mt-2 relative inline-block">
                <img src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} alt="Preview" className="h-32 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => {
                    if (imageFile) setImageFile(null);
                    else setImageUrl("");
                  }}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* 従来のURL入力 */}
            <div className="mt-3">
              <label className="block text-xs font-medium mb-1 text-gray-500">または画像のURLを入力</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setImageFile(null); // Clear file when URL is typed
                }}
                disabled={!!imageFile}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://画像のURL..."
              />
            </div>
            
            {/* プログレスバー */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 dark:bg-gray-700">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>

        </form>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 flex-shrink-0 flex gap-3 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {existingPin && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 text-sm font-medium py-2 px-3 rounded-md transition-colors whitespace-nowrap"
          >
            削除
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-black dark:text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          form="pin-form"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50"
        >
          {uploadProgress > 0 && uploadProgress < 100 ? "画像アップロード中..." : loading ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}
