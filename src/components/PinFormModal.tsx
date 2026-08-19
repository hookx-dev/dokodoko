"use client";

import PinForm from "./PinForm";
import { Pin } from "@/lib/firebase/firestore";

interface PinFormModalProps {
  mapId: string;
  isOpen: boolean;
  onClose: () => void;
  latitude: number | null;
  longitude: number | null;
  initialTitle?: string;
  initialAddress?: string;
  existingPin?: Pin;
}

export default function PinFormModal({ mapId, isOpen, onClose, latitude, longitude, initialTitle, initialAddress, existingPin }: PinFormModalProps) {
  if (!isOpen || latitude === null || longitude === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/50">
      <div className="bg-white dark:bg-zinc-900 shadow-2xl w-full md:w-[600px] h-full relative flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-zinc-900 z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-black dark:text-white">
            {existingPin ? "場所を編集" : "場所を登録"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* PinFormコンポーネントを埋め込む */}
          <PinForm 
            mapId={mapId}
            initialLat={latitude} 
            initialLng={longitude} 
            initialTitle={initialTitle}
            initialAddress={initialAddress}
            existingPin={existingPin}
            onSuccess={onClose} 
            onCancel={onClose} 
          />
        </div>
      </div>
    </div>
  );
}
