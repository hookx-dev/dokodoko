"use client";

import { useState, useEffect } from "react";

interface RecentListViewProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (coords: [number, number], name: string, address?: string) => void;
}

interface SearchHistoryItem {
  name: string;
  address?: string;
  coords: [number, number];
}

export default function RecentListView({ isOpen, onClose, onLocationSelect }: RecentListViewProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("searchHistory");
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

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
        className={`absolute top-0 left-0 h-full w-full md:w-96 bg-white dark:bg-zinc-900 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-bold">最近の検索</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* リスト内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-10">検索履歴がありません</p>
            ) : (
              history.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    if (onLocationSelect) {
                      onLocationSelect(item.coords, item.name, item.address);
                    }
                    onClose();
                  }}
                  className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{item.name}</h3>
                    {item.address && (
                      <p className="text-xs text-gray-500 truncate">{item.address}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
