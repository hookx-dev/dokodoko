"use client";

import { useAuth } from "@/contexts/AuthContext";

interface AdBannerProps {
  type?: "horizontal" | "square";
  className?: string;
}

export default function AdBanner({ type = "horizontal", className = "" }: AdBannerProps) {
  const { user } = useAuth();

  // 広告を非表示にする管理者メールアドレスのリスト
  // 本番環境では .env.local に NEXT_PUBLIC_ADMIN_EMAILS=admin@test.com,owner@test.com のように設定します
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(",").map(e => e.trim())
    : []; // 開発中に追加したい場合はここに ["youremail@example.com"] を追加してもOK

  // ログインしており、かつ管理者の場合は何も表示しない
  if (user && user.email && adminEmails.includes(user.email)) {
    return null;
  }

  const horizontalAdHtml = `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+5Z6WX" rel="nofollow">
<img border="0" width="468" height="60" alt="" src="https://www25.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001004000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+5Z6WX" alt="">`;

  const squareAdHtml = `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+68MF5" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www26.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001048000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+68MF5" alt="">`;

  const adHtml = type === "horizontal" ? horizontalAdHtml : squareAdHtml;

  return (
    <div className={`flex justify-center items-center my-4 overflow-hidden w-full ${className}`}>
      <div 
        className="a8-ad-container flex justify-center scale-90 sm:scale-100 origin-center"
        dangerouslySetInnerHTML={{ __html: adHtml }} 
      />
    </div>
  );
}
