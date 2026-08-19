"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import Logo from "@/components/Logo";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWaitingForLogin, setIsWaitingForLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleStart = () => {
    if (!user) {
      setIsWaitingForLogin(true);
      setIsAuthModalOpen(true);
      return;
    }
    redirectToDashboard();
  };

  const redirectToDashboard = () => {
    router.push("/dashboard");
  };

  // Watch for user login completion if we were waiting for it
  useEffect(() => {
    if (user && isWaitingForLogin) {
      setIsWaitingForLogin(false);
      redirectToDashboard();
    }
  }, [user, isWaitingForLogin]);

  // Handle scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-50/90 dark:bg-black/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-zinc-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                特徴
              </a>
              <a href="#how-to-use" onClick={(e) => scrollToSection(e, 'how-to-use')} className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                使い方
              </a>
              <button
                onClick={handleStart}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm shadow-md shadow-indigo-500/20 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {user ? "ダッシュボードへ" : "ログイン / 登録"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 z-0 opacity-100 dark:opacity-80" style={{ backgroundImage: "url('/images/abstract_map_bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/80 dark:from-transparent dark:via-transparent dark:to-zinc-900/80"></div>
        
        {/* Floating Map Pins in Background */}
        <div className="absolute z-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[15%] animate-bounce" style={{ animationDuration: '3s' }}>
            <span className="text-5xl filter drop-shadow-md">📍</span>
          </div>
          <div className="absolute top-[40%] right-[20%] animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <span className="text-6xl filter drop-shadow-md opacity-80">📍</span>
          </div>
          <div className="absolute bottom-[30%] left-[25%] animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
            <span className="text-4xl filter drop-shadow-md opacity-90">📍</span>
          </div>
          <div className="absolute top-[15%] right-[35%] animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '2s' }}>
            <span className="text-4xl filter drop-shadow-md opacity-60">📍</span>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center mt-12">
          {/* Glassmorphism Container for Readability */}
          <div className="bg-white/70 dark:bg-black/60 backdrop-blur-md rounded-3xl p-6 md:p-12 shadow-2xl border border-white/50 dark:border-zinc-700/50">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 md:mb-8 drop-shadow-sm leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                カップルや友達とつくる
              </span>
              <span className="block mt-2 text-slate-900 dark:text-white">共有マップアプリ</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-slate-800 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
              週末のデートプラン作り、友達との旅行計画、そして大切な人との思い出の記録に。
              「DokoDoko」は、行きたい場所をGoogleマップ上にピン留めしてリアルタイムに共有できる、完全無料のプライベート地図アプリです。
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-200"
              >
                {user ? "ダッシュボードを開く" : "無料で地図を作り始める"}
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-slate-50 dark:bg-zinc-900/50 scroll-mt-20 border-t border-slate-200 dark:border-zinc-800">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">DokoDokoでできること</h2>
            <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400">シンプルで使いやすい、マップ共有の新しい形</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-zinc-800/80 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/50 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-3">誰とでも、いくつでも共有</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                旅行仲間との共有マップ、恋人とのデートスポットまとめ、自分だけの秘密のカフェリストなど、目的別に複数の地図を作成できます。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-zinc-800/80 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/50 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-bold mb-3">写真と一緒に思い出を記録</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                気になった場所を検索してピン留め。その場所で撮った写真をアップロードすれば、地図を眺めるだけで思い出が鮮明に蘇ります。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-zinc-800/80 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-700/50 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-3">スマホアプリとしても使える</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                ブラウザから「ホーム画面に追加」するだけで、ネイティブアプリのように全画面でサクサク動作。インストール不要ですぐに使えます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-24 bg-white dark:bg-black scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">こんなシーンで大活躍</h2>
            <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400">アイデア次第で、DokoDokoの使い方は無限大</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-3xl flex-shrink-0 border border-slate-100 dark:border-zinc-800">
                ❤️
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">カップルのデートマップ</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">「次ここ行きたいね！」テレビやSNSで見つけた気になるスポットを2人でピン留め。週末のデート先選びがもっと楽しくなります。</p>
              </div>
            </div>
            
            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-3xl flex-shrink-0 border border-slate-100 dark:border-zinc-800">
                ✈️
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">グループ旅行のしおり</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">旅行先の観光名所やホテル、レストランを事前にマッピング。リンクを共有するだけで、全員が同じ地図を見ながら旅行を楽しめます。</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-3xl flex-shrink-0 border border-slate-100 dark:border-zinc-800">
                ☕
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">自分だけのお店リスト</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">美味しかったカフェや、また行きたい居酒屋を自分用にメモ。「あの辺で良いお店あったっけ？」という時も、地図からすぐに探せます。</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-3xl flex-shrink-0 border border-slate-100 dark:border-zinc-800">
                🏕️
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">趣味の記録（キャンプ・御朱印など）</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">制覇したキャンプ場や、巡った神社の御朱印記録にも最適。アイコンのカスタマイズ機能で、あなたらしい趣味の地図が作れます。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="relative py-24 bg-slate-50 dark:bg-zinc-900/50 scroll-mt-20 border-t border-slate-200 dark:border-zinc-800">
        {/* Removed background map here to create contrast and clear separation between sections */}
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">かんたん3ステップ</h2>
            <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400">誰でも直感的に使いこなせます</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Step 1 */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-2xl font-black mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">ログインして地図を作成</h3>
              <p className="text-slate-600 dark:text-slate-400">Googleアカウントでログインし、ダッシュボードから新しい地図を作ります。</p>
              
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-zinc-800 dark:to-zinc-800"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-2xl font-black mb-6 z-10 relative">2</div>
              <h3 className="text-xl font-bold mb-3">場所を検索してピンを追加</h3>
              <p className="text-slate-600 dark:text-slate-400">検索バーでスポット名を入力し、写真やメモと一緒にピンを立てましょう。</p>
              
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-zinc-800 dark:to-zinc-800"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-2xl font-black mb-6 z-10 relative">3</div>
              <h3 className="text-xl font-bold mb-3">URLを共有</h3>
              <p className="text-slate-600 dark:text-slate-400">地図の招待リンクを発行して、パートナーや友人にLINE等でシェアするだけ！</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              今すぐ始める
            </button>
          </div>
        </div>
      </section>

      {/* 広告エリア（LP下部） */}
      <section className="py-12 bg-white dark:bg-black border-t border-slate-100 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <AdBanner type="horizontal" />
        </div>
      </section>

      <Footer />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsWaitingForLogin(false);
        }} 
      />
    </div>
  );
}
