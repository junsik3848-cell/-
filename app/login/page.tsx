"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function isKakaoTalkBrowser() {
  if (typeof navigator === "undefined") return false;
  return /KAKAOTALK/i.test(navigator.userAgent);
}

function isOtherInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Instagram|FBAN|FBAV|Line\/|DaumApps|MicroMessenger/i.test(ua);
}

function openInChrome(url: string) {
  const intentUrl = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
  window.location.href = intentUrl;
}

export default function LoginPage() {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingKakao, setIsLoadingKakao] = useState(false);
  const [kakaoTalk, setKakaoTalk] = useState(false);
  const [otherInApp, setOtherInApp] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setKakaoTalk(isKakaoTalkBrowser());
    setOtherInApp(isOtherInAppBrowser());
  }, []);

  async function handleGoogleLogin() {
    setIsLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleKakaoLogin() {
    setIsLoadingKakao(true);
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/darkwater/800/1200"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 w-full max-w-sm mx-auto">
        <div className="mb-16 text-center">
          <h1 className="font-brand text-6xl font-bold tracking-tight bg-gradient-to-r from-surface-tint to-secondary bg-clip-text text-transparent pb-1">
            LUNKER
          </h1>
          <p className="text-on-surface-variant text-sm mt-3">프로 앵글러를 위한 여정의 시작</p>
        </div>

        {kakaoTalk ? (
          /* 카카오톡 인앱브라우저: 카카오 로그인만 표시 */
          <div className="w-full">
            <KakaoButton loading={isLoadingKakao} onClick={handleKakaoLogin} />
          </div>
        ) : otherInApp ? (
          /* 기타 인앱브라우저: Chrome으로 열기 안내 */
          <div className="w-full space-y-4">
            <div className="w-full rounded-xl bg-surface-container border border-outline-variant/50 px-5 py-5 text-center space-y-3">
              <p className="text-2xl">⚠️</p>
              <p className="text-sm font-bold text-on-surface">
                인앱 브라우저에서는<br />로그인이 지원되지 않아요
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Chrome 또는 Safari에서 접속해 주세요.
              </p>
            </div>
            <button
              onClick={() => openInChrome(window.location.href)}
              className="w-full h-14 bg-surface-tint rounded-xl flex items-center justify-center gap-2 text-on-primary text-sm font-bold glow-mint active:scale-95 transition-all"
            >
              Chrome으로 열기
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="w-full h-11 rounded-xl border border-outline-variant text-on-surface-variant text-xs font-medium active:scale-95 transition-all"
            >
              주소 복사하기
            </button>
          </div>
        ) : (
          /* 일반 브라우저: 카카오 + 구글 */
          <>
            <div className="w-full space-y-3">
              <KakaoButton loading={isLoadingKakao} onClick={handleKakaoLogin} />
              <button
                onClick={handleGoogleLogin}
                disabled={isLoadingGoogle}
                className="w-full h-14 glass-panel rounded-lg flex items-center justify-center gap-3 text-on-surface text-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoadingGoogle ? <LoadingSpinner color="white" /> : <><GoogleIcon />Google로 시작하기</>}
              </button>
            </div>
            <p className="mt-6 text-xs text-outline text-center leading-relaxed">
              계속 진행하면 LUNKER의{" "}
              <span className="text-on-surface-variant">서비스 이용약관</span> 및{" "}
              <a href="/privacy" className="text-on-surface-variant underline underline-offset-2 hover:text-on-surface transition-colors">개인정보 처리방침</a>에 동의한 것으로 간주합니다.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function KakaoButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full h-14 rounded-lg flex items-center justify-center gap-3 text-[#191919] text-sm font-semibold active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ backgroundColor: "#FEE500" }}
    >
      {loading ? <LoadingSpinner color="dark" /> : <><KakaoIcon />카카오로 시작하기</>}
    </button>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C6.925 3 2.857 6.358 2.857 10.5c0 2.685 1.607 5.048 4.054 6.488L5.786 21l4.607-2.338C10.944 18.884 11.466 18.929 12 18.929c5.075 0 9.143-3.358 9.143-7.429C21.143 6.358 17.075 3 12 3z"
        fill="#191919"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107" />
      <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00" />
      <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50" />
      <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2" />
    </svg>
  );
}

function LoadingSpinner({ color }: { color: "white" | "dark" }) {
  const c = color === "dark" ? "#191919" : "currentColor";
  return (
    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="4" strokeOpacity="0.25" />
      <path fill={c} fillOpacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
