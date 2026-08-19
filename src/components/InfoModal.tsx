"use client";

import { useEffect, useState } from "react";

export type InfoType = "hints" | "help" | null;

interface InfoModalProps {
  type: InfoType;
  onClose: () => void;
}

export default function InfoModal({ type, onClose }: InfoModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [type]);

  if (!type && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ${type ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${type ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
          type ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {type === "hints" ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.496 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  使い方のヒント
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  よくある質問（ヘルプ）
                </>
              )}
            </h3>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {type === "hints" ? (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">ピンを立てる📍</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      地図上の好きな場所を<strong className="text-gray-900 dark:text-gray-200">長押し</strong>（パソコンの場合は左クリック）すると、その場所にピンを立てることができます。
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">思い出を残す📸</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      立てたピンをタップすると詳細画面が開きます。そこで写真をアップロードしたり、メモを残したりできます。
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">他の人と共有する🤝</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      メニューの「招待リンクをコピー」を押して、友人や家族などにURLを送りましょう。一緒に同じ地図を編集できるようになります！
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                    <span className="text-indigo-500 font-black">Q.</span> ピンを削除するには？
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-6">
                    <span className="text-indigo-400 font-black mr-2">A.</span>
                    ピンをタップして開く詳細画面の一番下にある「削除する」ボタンから消すことができます。
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                    <span className="text-indigo-500 font-black">Q.</span> 複数人で使えますか？
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-6">
                    <span className="text-indigo-400 font-black mr-2">A.</span>
                    はい！ダッシュボードからマップを作成後、招待リンクを共有することで、誰とでも一緒に地図を作り上げることができます。
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                    <span className="text-indigo-500 font-black">Q.</span> 写真は何枚まで保存できますか？
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-6">
                    <span className="text-indigo-400 font-black mr-2">A.</span>
                    現在は枚数制限を設けておりませんが、なるべくリサイズして保存して頂けると助かります。今後のアップデートでギャラリー機能等を追加予定です。
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white font-medium py-3 rounded-xl transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
