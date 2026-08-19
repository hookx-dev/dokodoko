"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

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
  const [adHtml, setAdHtml] = useState<string>("");

  useEffect(() => {
    // クライアントサイドでのみランダムに広告を選ぶ（Hydrationエラー防止）
    const horizontalAds = [
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www25.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001004000&mc=1"></a><img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+5Z6WX" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+60WN5" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www24.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001012000&mc=1"></a><img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+60WN5" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+6E71D" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www21.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001074000&mc=1"></a><img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+6E71D" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+5ZMCH" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www27.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001006000&mc=1"></a><img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+5ZMCH" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+6FWRL" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www27.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001082000&mc=1"></a><img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+6FWRL" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+60H7L" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www23.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001010000&mc=1"></a><img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+60H7L" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+60OXD" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www26.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001011000&mc=1"></a><img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+60OXD" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+614CX" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www24.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001013000&mc=1"></a><img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+614CX" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+6ARKX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www27.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001058000&mc=1"></a><img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+6ARKX" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+61C2P" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www29.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001014000&mc=1"></a><img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+61C2P" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+61JSH" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www22.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001015000&mc=1"></a><img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+61JSH" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+61RI9" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www24.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001016000&mc=1"></a><img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+61RI9" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+61Z81" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www22.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001017000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+61Z81" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+626XT" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www20.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001018000&mc=1"></a><img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+626XT" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+62ENL" rel="nofollow"><img border="0" width="320" height="50" alt="" src="https://www22.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001019000&mc=1"></a><img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+62ENL" alt="">`,
    ];

    const squareAds = [
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+6B70H" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www29.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001060000&mc=1"></a><img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+6B70H" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+67Z9T" rel="nofollow"><img border="0" width="336" height="280" alt="" src="https://www26.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001045000&mc=1"></a><img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+67Z9T" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+68MF5" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www26.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001048000&mc=1"></a><img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+68MF5" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+64RJ5" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www22.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001030000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+64RJ5" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+6GZCH" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www28.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001087000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+6GZCH" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+67C4H" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www29.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001042000&mc=1"></a><img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+67C4H" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+64Z8X" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www23.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001031000&mc=1"></a><img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+64Z8X" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+68U4X" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www29.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001049000&mc=1"></a><img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+68U4X" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+68EPD" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www25.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001047000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+68EPD" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+691UP" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www29.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001050000&mc=1"></a><img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+691UP" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+686ZL" rel="nofollow"><img border="0" width="336" height="280" alt="" src="https://www26.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001046000&mc=1"></a><img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+686ZL" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+67JU9" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www28.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001043000&mc=1"></a><img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+67JU9" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+6GRMP" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www22.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001086000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+6GRMP" alt="">`,
      `<a href="https://px.a8.net/svt/ejp?a8mat=4BAA98+8V4D0Y+40T2+644DT" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www29.a8.net/svt/bgt?aid=260820332536&wid=001&eno=01&mid=s00000018767001027000&mc=1"></a><img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4BAA98+8V4D0Y+40T2+644DT" alt="">`,
    ];

    const ads = type === "horizontal" ? horizontalAds : squareAds;
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    setAdHtml(randomAd);
  }, [type]);

  if (!adHtml) return <div className={`flex justify-center items-center my-4 overflow-hidden w-full min-h-[50px] ${className}`}></div>;

  return (
    <div className={`flex justify-center items-center my-4 overflow-hidden w-full ${className}`}>
      <div 
        className="a8-ad-container flex justify-center scale-90 sm:scale-100 origin-center"
        dangerouslySetInnerHTML={{ __html: adHtml }} 
      />
    </div>
  );
}
