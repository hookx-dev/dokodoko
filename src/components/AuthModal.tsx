"use client";

import { useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Googleログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");
      if (isLoginMode) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        if (!username.trim()) {
          setErrorMsg("ユーザー名を入力してください");
          setLoading(false);
          return;
        }
        if (!agreeTerms) {
          setErrorMsg("利用規約とプライバシーポリシーに同意してください");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set Username
        await updateProfile(userCredential.user, {
          displayName: username,
        });
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg("このメールアドレスは既に登録されています。");
      } else if (error.code === 'auth/invalid-credential') {
        setErrorMsg("メールアドレスまたはパスワードが間違っています。");
      } else {
        setErrorMsg("認証エラーが発生しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
        >
          ✕
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
            {isLoginMode ? "ログイン" : "新規登録"}
          </h2>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors mb-6 disabled:opacity-50"
          >
            {/* 簡易的なGoogleアイコンの代わり */}
            <span className="font-bold text-lg">G</span>
            Googleで{isLoginMode ? "ログイン" : "登録"}
          </button>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">または</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ユーザー名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLoginMode}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="ニックネーム"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="••••••••"
              />
              {isLoginMode && (
                <div className="text-right mt-1.5">
                  <Link href="/reset-password" onClick={onClose} className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    パスワードをお忘れですか？
                  </Link>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            )}

            {!isLoginMode && (
              <label className="flex items-start gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                  <Link href="/terms" target="_blank" className="text-indigo-600 hover:underline">利用規約</Link>
                  および
                  <Link href="/privacy" target="_blank" className="text-indigo-600 hover:underline">プライバシーポリシー</Link>
                  に同意します
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "処理中..." : isLoginMode ? "ログイン" : "新規登録"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLoginMode ? "アカウントをお持ちでないですか？" : "すでにアカウントをお持ちですか？"}{" "}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-blue-600 hover:underline font-medium"
            >
              {isLoginMode ? "新規登録はこちら" : "ログインはこちら"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
