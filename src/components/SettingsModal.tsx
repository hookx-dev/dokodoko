"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  updateUserProfile, 
  updateUserEmail, 
  updateUserPassword, 
  reauthenticate 
} from "@/lib/firebase/auth";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, reloadUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordForPw, setCurrentPasswordForPw] = useState("");

  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPasswordForEmail("");
      setCurrentPasswordForPw("");
      setNewPassword("");
      setStatus({ type: '', message: '' });
      if (user) {
        setDisplayName(user.displayName || "");
        setEmail(user.email || "");
      }
    }
  }, [isOpen, user]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUserProfile(user, displayName);
      await reloadUser(); // Reactのstateを更新して画面に反映させる
      showStatus('success', 'プロフィールを更新しました。');
    } catch (err: any) {
      console.error(err);
      showStatus('error', 'プロフィールの更新に失敗しました。');
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!currentPasswordForEmail) {
      showStatus('error', 'セキュリティのため、現在のパスワードを入力してください。');
      return;
    }
    
    try {
      await reauthenticate(user, currentPasswordForEmail);
      await updateUserEmail(user, email);
      await reloadUser(); // Reactのstateを更新して画面に反映させる
      setCurrentPasswordForEmail("");
      showStatus('success', 'メールアドレスを更新しました。');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        showStatus('error', 'パスワードが間違っています。');
      } else if (err.code === 'auth/email-already-in-use') {
        showStatus('error', 'このメールアドレスは既に使われています。');
      } else {
        showStatus('error', 'メールアドレスの更新に失敗しました。');
      }
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) {
      showStatus('error', '新しいパスワードは6文字以上で入力してください。');
      return;
    }
    
    try {
      await reauthenticate(user, currentPasswordForPw);
      await updateUserPassword(user, newPassword);
      setNewPassword("");
      setCurrentPasswordForPw("");
      showStatus('success', 'パスワードを更新しました。');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        showStatus('error', '現在のパスワードが間違っています。');
      } else {
        showStatus('error', 'パスワードの更新に失敗しました。');
      }
    }
  };

  // アニメーションのために、完全にnullを返すのではなく opacity で制御するか、
  // isOpen が false でも一瞬レンダリングを残すのが定石ですが、今回は InfoModal に合わせて isOpen=false のときは css transform を使わずそのまま消すか、
  // InfoModal と同じような isVisible 管理にするのが良いでしょう。
  // ここではシンプルに !isOpen の時は完全に非表示にします。(トランジションを効かせるため 少しのディレイが必要ですが、Tailwind の group でないので省略可能)
  // InfoModal の実装に合わせます。

  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!user || (!isOpen && !isVisible)) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop: removed backdrop-blur for performance */}
      <div 
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal Container: opaque background, removed blur */}
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-50 dark:bg-zinc-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 transform ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header: opaque background */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">アカウント設定</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content: Added overscroll-contain for smoother mobile scrolling */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative z-10 overscroll-contain">
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-100/50 to-transparent dark:from-indigo-900/20 dark:to-transparent pointer-events-none z-0"></div>

          <div className="relative z-10">
            {status.message && (
              <div className={`mb-6 p-4 rounded-2xl border font-medium flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-green-50/80 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-300' : 'bg-red-50/80 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-300'}`}>
                {status.type === 'success' ? '✅' : '⚠️'} {status.message}
              </div>
            )}

            <div className="space-y-6">
              {/* プロフィール設定 */}
              <section className="bg-white/90 dark:bg-zinc-800/90 shadow-sm border border-slate-200/60 dark:border-zinc-700/60 rounded-3xl overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">プロフィール</h2>
                </div>
                <div className="px-5 sm:px-6 py-5">
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ユーザー名 (表示名)</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700/80 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 dark:text-white transition-shadow"
                        placeholder="ニックネーム"
                      />
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5">
                        プロフィールを保存
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* メールアドレス設定 */}
              <section className="bg-white/90 dark:bg-zinc-800/90 shadow-sm border border-slate-200/60 dark:border-zinc-700/60 rounded-3xl overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">メールアドレス</h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">変更には現在のパスワードが必要です</p>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-5">
                  <form onSubmit={handleUpdateEmail} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">新しいメールアドレス</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700/80 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 dark:text-white transition-shadow"
                        placeholder="new@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">現在のパスワード</label>
                      <input
                        type="password"
                        value={currentPasswordForEmail}
                        onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700/80 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 dark:text-white transition-shadow"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5">
                        メールアドレスを更新
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* パスワード設定 */}
              <section className="bg-white/90 dark:bg-zinc-800/90 shadow-sm border border-slate-200/60 dark:border-zinc-700/60 rounded-3xl overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">パスワードの変更</h2>
                </div>
                <div className="px-5 sm:px-6 py-5">
                  <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">現在のパスワード</label>
                      <input
                        type="password"
                        value={currentPasswordForPw}
                        onChange={(e) => setCurrentPasswordForPw(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700/80 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 dark:text-white transition-shadow"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">新しいパスワード <span className="text-slate-400 font-normal">(6文字以上)</span></label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-700/80 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 dark:text-white transition-shadow"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="pt-2">
                      <button type="submit" className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5">
                        パスワードを更新
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
