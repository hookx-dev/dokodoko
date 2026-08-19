import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start mb-6 md:mb-0">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Logo className="scale-90 origin-left" />
            </Link>
          </div>
          
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              利用規約
            </Link>
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
          </div>
        </div>
        
        <div className="mt-8 md:mt-0 md:order-1 flex justify-center md:justify-start">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} DokoDoko. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
