"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleGoogleLogin() {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // OAuth는 리디렉트되므로 loading 상태 유지
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/darkwater/800/1200"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 w-full max-w-sm mx-auto">
        {/* 로고 */}
        <div className="mb-16 text-center">
          <h1 className="font-brand text-6xl font-bold tracking-tight bg-gradient-to-r from-surface-tint to-secondary bg-clip-text text-transparent pb-1">
            LUNKER
          </h1>
          <p className="text-on-surface-variant text-sm mt-3">프로 앵글러를 위한 여정의 시작</p>
        </div>

        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-14 glass-panel rounded-lg flex items-center justify-center gap-3 text-on-surface text-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <GoogleIcon />
              Google로 시작하기
            </>
          )}
        </button>

        <p className="mt-6 text-xs text-outline text-center leading-relaxed">
          계속 진행하면 LUNKER의{" "}
          <span className="text-on-surface-variant">서비스 이용약관</span> 및{" "}
          <span className="text-on-surface-variant">개인정보 처리방침</span>에 동의한 것으로 간주합니다.
        </p>
      </div>
    </main>
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

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
