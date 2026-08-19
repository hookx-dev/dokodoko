"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import AuthModal from "./AuthModal";
import { MapType } from "@/lib/firebase/firestore";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  title?: string;
  type?: MapType;
  icon?: string;
  memberCount?: number;
}

export default function Header({ title, type, icon, memberCount }: HeaderProps = {}) {
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <>
      <header className="hidden md:flex flex-col z-10 flex-shrink-0 bg-white dark:bg-black shadow-sm">
        {/* Top Title Bar */}
        <div className="py-1.5 md:py-2 px-4 md:px-6 min-h-[56px] md:min-h-[60px] flex justify-between items-center border-b border-gray-100 dark:border-gray-900">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <Image 
              src="/logo_full.png" 
              alt="DokoDoko Logo" 
              width={130} 
              height={36} 
              className="w-[100px] md:w-[130px] h-auto object-contain"
              priority
            />
          </Link>

          {title && (
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-3 w-[50%] justify-center">
              {(icon || type) && (
                <div className="flex shrink-0 items-center justify-center w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl shadow-sm text-xl">
                  {icon ? icon : type === "personal" ? "🧭" : type === "partner" ? "❤️" : type === "friends" ? "🍻" : "🗺️"}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight truncate">
                  {title}
                </span>
                {memberCount !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium truncate">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 5.963-2.06.438-.398.81-.84.41-1.412A11.98 11.98 0 0010 12a11.98 11.98 0 00-6.535 2.493z" />
                    </svg>
                    <span>メンバー {memberCount}人</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div>
            {loading ? (
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded shrink-0"></div>
            ) : user ? (
              <div className="flex items-center gap-3 md:gap-5 shrink-0">
                <span className="text-sm md:text-lg hidden sm:inline-block">
                  ようこそ、{user.displayName || user.email?.split("@")[0]} さん
                </span>
                <button 
                  onClick={handleSignOut}
                  className="text-sm md:text-lg font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2 md:ml-4"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black dark:bg-white text-white dark:text-black px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-sm md:text-lg font-bold hover:opacity-80 transition-opacity shrink-0"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
