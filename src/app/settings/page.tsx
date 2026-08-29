"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { PREMIUM_PRICE_JPY } from "@/lib/plan";
import {
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  reauthenticate,
  deleteAccount
} from "@/lib/firebase/auth";
import Header from "@/components/Header";
import Link from "next/link";
import { useRef } from "react";

export default function SettingsPage() {
  const { user, loading, reloadUser } = useAuth();
  const { plan, subscriptionStatus } = usePlan();
  const router = useRouter();
  const [isPlanActionLoading, setIsPlanActionLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [currentPasswordForPw, setCurrentPasswordForPw] = useState("");

  const [passwordForDeletion, setPasswordForDeletion] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    // スクロールしてメッセージを見せる
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      let photoURL = user.photoURL || undefined;
      
      if (imageFile) {
        // R2へアップロード
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: imageFile.name,
            contentType: imageFile.type,
          }),
        });
        
        if (!res.ok) throw new Error("Failed to get upload URL");
        
        const { signedUrl, publicUrl } = await res.json();
        
        // S3 (R2) に直接アップロード
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: imageFile,
          headers: {
            "Content-Type": imageFile.type,
          },
        });
        
        if (!uploadRes.ok) throw new Error("Failed to upload image");
        
        photoURL = publicUrl;
      }
      
      await updateUserProfile(user, displayName, photoURL);
      await reloadUser();
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
      await reloadUser();
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

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      setIsPlanActionLoading(true);
      const idToken = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      showStatus('error', '決済ページの作成に失敗しました。');
    } finally {
      setIsPlanActionLoading(false);
    }
  };

  const handleManagePlan = async () => {
    if (!user) return;
    try {
      setIsPlanActionLoading(true);
      const idToken = await user.getIdToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to create portal session");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      showStatus('error', 'プラン管理画面の作成に失敗しました。');
    } finally {
      setIsPlanActionLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!passwordForDeletion) {
      showStatus('error', 'アカウントを削除するには、現在のパスワードを入力してください。');
      return;
    }

    try {
      await reauthenticate(user, passwordForDeletion);
      await deleteAccount(user);
      // user will become null, causing redirect to '/' via useEffect
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        showStatus('error', 'パスワードが間違っています。');
      } else {
        showStatus('error', 'アカウントの削除に失敗しました。');
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white font-sans">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <button onClick={() => router.back()} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            前のページに戻る
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">アカウント設定</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">プロフィールやセキュリティ情報を管理します</p>
        </div>

        {status.message && (
          <div className={`mb-8 p-4 rounded-2xl border font-medium flex items-center gap-3 animate-fade-in shadow-sm ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-300'}`}>
            {status.type === 'success' ? '✅' : '⚠️'} {status.message}
          </div>
        )}

        <div className="space-y-8">
          {/* プラン設定 */}
          <section className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">ご利用プラン</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">現在のプランと課金状況を確認・変更します</p>
              </div>
            </div>
            <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {plan === "premium" ? "プレミアムプラン" : "フリープラン"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {plan === "premium"
                    ? `月額¥${PREMIUM_PRICE_JPY}${subscriptionStatus === "active" ? "・利用中" : ""}`
                    : "地図の作成数・招待人数・ピン数に制限があります"}
                </p>
              </div>
              {plan === "premium" ? (
                <button
                  onClick={handleManagePlan}
                  disabled={isPlanActionLoading}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {isPlanActionLoading ? "処理中..." : "プランを管理する"}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={isPlanActionLoading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {isPlanActionLoading ? "処理中..." : "プレミアムにアップグレード"}
                </button>
              )}
            </div>
          </section>

          {/* プロフィール設定 */}
          <section className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">プロフィール</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">アプリ内で他のメンバーに表示される名前です</p>
              </div>
            </div>
            <div className="px-6 py-6">
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 max-w-xl">
                
                {/* プロフィール画像 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">プロフィール画像</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-xl text-slate-500 overflow-hidden border border-slate-300 dark:border-zinc-700">
                      {previewUrl || user?.photoURL ? (
                        <img src={previewUrl || user?.photoURL || ""} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{displayName ? displayName.charAt(0).toUpperCase() : "?"}</span>
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        画像を選択
                      </button>
                      {imageFile && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">新しい画像が選択されています</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">ユーザー名 (表示名)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 dark:text-white transition-all"
                    placeholder="ニックネーム"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5">
                    プロフィールを保存
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* メールアドレス設定 */}
          <section className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">メールアドレス</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">ログインに使用するメールアドレスを変更します</p>
              </div>
            </div>
            <div className="px-6 py-6">
              <form onSubmit={handleUpdateEmail} className="flex flex-col gap-5 max-w-xl">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">新しいメールアドレス</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 dark:text-white transition-all"
                    placeholder="new@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">現在のパスワード <span className="text-slate-400 font-normal ml-2 text-xs">セキュリティ確認のため</span></label>
                  <input
                    type="password"
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5">
                    メールアドレスを更新
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* パスワード設定 */}
          <section className="bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">パスワードの変更</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">アカウントのセキュリティを強化します</p>
              </div>
            </div>
            <div className="px-6 py-6">
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 max-w-xl">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">現在のパスワード</label>
                  <input
                    type="password"
                    value={currentPasswordForPw}
                    onChange={(e) => setCurrentPasswordForPw(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">新しいパスワード <span className="text-slate-400 font-normal ml-2 text-xs">6文字以上</span></label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-zinc-950 dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5">
                    パスワードを更新
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* アカウント削除 (Danger Zone) */}
          <section className="bg-white dark:bg-zinc-900 shadow-sm border border-red-200 dark:border-red-900/30 rounded-3xl overflow-hidden mt-12">
            <div className="px-6 py-5 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">アカウントの削除</h2>
                <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-0.5">この操作は取り消すことができません</p>
              </div>
            </div>
            <div className="px-6 py-6">
              {!showDeleteConfirm ? (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    アカウントを削除すると、あなたのプロフィール情報やすべてのデータが完全に削除され、復元することはできなくなります。
                  </p>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800/30 dark:hover:bg-red-900/40 rounded-xl text-sm font-bold transition-all"
                  >
                    アカウントを削除する手続きへ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDeleteAccount} className="flex flex-col gap-5 max-w-xl animate-fade-in">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">本当にアカウントを削除しますか？</p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80">セキュリティのため、現在のパスワードを入力して確認してください。</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">現在のパスワード</label>
                    <input
                      type="password"
                      value={passwordForDeletion}
                      onChange={(e) => setPasswordForDeletion(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-red-300 dark:border-red-900/50 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-zinc-950 dark:text-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setPasswordForDeletion("");
                      }}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all"
                    >
                      キャンセル
                    </button>
                    <button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-500/20 transition-all transform hover:-translate-y-0.5">
                      完全に削除する
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
