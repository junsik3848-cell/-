"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_REGEX = /^[a-zA-Z0-9_가-힣]{2,20}$/;

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate(value: string) {
    if (value.length < 2) return "닉네임은 2자 이상이어야 해요";
    if (value.length > 20) return "닉네임은 20자 이하여야 해요";
    if (!USERNAME_REGEX.test(value)) return "한글, 영문, 숫자, 밑줄(_)만 사용 가능해요";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate(username.trim());
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ username: username.trim() })
      .eq("id", user.id);

    if (updateError) {
      if (updateError.code === "23505") {
        setError("이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요.");
      } else {
        setError("오류가 발생했어요. 다시 시도해주세요.");
      }
      setIsLoading(false);
      return;
    }

    router.push("/feed");
  }

  const validationError = username ? validate(username) : "";
  const isValid = username.length > 0 && !validationError;

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* 배경 */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/darkwater/800/1200"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 w-full max-w-sm mx-auto">
        {/* 로고 */}
        <div className="mb-2 text-center">
          <h1 className="font-brand text-4xl font-bold tracking-tight bg-gradient-to-r from-surface-tint to-secondary bg-clip-text text-transparent">
            LUNKER
          </h1>
        </div>

        {/* 안내 */}
        <div className="mb-10 text-center">
          <p className="text-on-surface text-xl font-bold mt-6">닉네임을 정해주세요</p>
          <p className="text-on-surface-variant text-sm mt-2">
            LUNKER에서 사용할 나만의 닉네임이에요
          </p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="예: bass_hunter_99"
                maxLength={20}
                className={`w-full h-14 px-4 rounded-xl bg-surface-container border text-on-surface text-base placeholder:text-outline focus:outline-none transition-all ${
                  error
                    ? "border-error focus:border-error"
                    : isValid
                    ? "border-surface-tint focus:border-surface-tint"
                    : "border-outline-variant focus:border-surface-tint"
                }`}
                autoFocus
                autoComplete="off"
                autoCapitalize="none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-outline">
                {username.length}/20
              </span>
            </div>

            {/* 에러 또는 유효성 안내 */}
            <div className="mt-2 min-h-[20px] px-1">
              {(error || validationError) ? (
                <p className="text-xs text-error">{error || validationError}</p>
              ) : isValid ? (
                <p className="text-xs text-surface-tint">사용 가능한 닉네임이에요</p>
              ) : (
                <p className="text-xs text-on-surface-variant">한글, 영문, 숫자, 밑줄(_) 사용 가능 · 2~20자</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full h-14 bg-surface-tint text-on-primary font-bold text-base rounded-xl glow-mint hover:bg-primary-fixed active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? "저장 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
