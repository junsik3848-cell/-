"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CameraIcon } from "@/components/icons";
import { compressImage } from "@/lib/compress-image";

const USERNAME_REGEX = /^[a-zA-Z0-9_가-힣]{2,20}$/;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(value: string) {
    if (value.length < 2) return "닉네임은 2자 이상이어야 해요";
    if (value.length > 20) return "닉네임은 20자 이하여야 해요";
    if (!USERNAME_REGEX.test(value)) return "한글, 영문, 숫자, 밑줄(_)만 사용 가능해요";
    return "";
  }

  async function handleNicknameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate(username.trim());
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error: updateError } = await supabase
      .from("users")
      .update({ username: username.trim() })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.code === "23505" ? "이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요." : "오류가 발생했어요. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setStep(2);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, "avatar");
    setAvatarFile(compressed);
    setAvatarPreview(URL.createObjectURL(compressed));
  }

  async function handleAvatarSubmit(skip = false) {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (!skip && avatarFile) {
      const ext = avatarFile.type.split("/")[1] || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("users").update({ avatar_url: data.publicUrl }).eq("id", user.id);
      }
    }

    router.push("/feed");
  }

  const validationError = username ? validate(username) : "";
  const isValid = username.length > 0 && !validationError;

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/darkwater/800/1200"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 w-full max-w-sm mx-auto">

        {/* 단계 표시 */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? "bg-surface-tint" : "bg-surface-tint/40"}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? "bg-surface-tint" : "bg-surface-tint/40"}`} />
        </div>

        {/* STEP 1: 닉네임 */}
        {step === 1 && (
          <>
            <div className="mb-2 text-center">
              <h1 className="font-brand text-4xl font-bold tracking-tight bg-gradient-to-r from-surface-tint to-secondary bg-clip-text text-transparent">
                LUNKER
              </h1>
            </div>
            <div className="mb-10 text-center">
              <p className="text-on-surface text-xl font-bold mt-6">닉네임을 정해주세요</p>
              <p className="text-on-surface-variant text-sm mt-2">LUNKER에서 사용할 나만의 닉네임이에요</p>
            </div>
            <form onSubmit={handleNicknameSubmit} className="w-full space-y-4">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    placeholder="예: bass_hunter_99"
                    maxLength={20}
                    className={`w-full h-14 px-4 rounded-xl bg-surface-container border text-on-surface text-base placeholder:text-outline focus:outline-none transition-all ${
                      error ? "border-error" : isValid ? "border-surface-tint" : "border-outline-variant focus:border-surface-tint"
                    }`}
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-outline">
                    {username.length}/20
                  </span>
                </div>
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
                className="w-full h-14 bg-surface-tint text-on-primary font-bold text-base rounded-xl glow-mint hover:bg-primary-fixed active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? "저장 중..." : "다음"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: 프로필 이미지 */}
        {step === 2 && (
          <>
            <div className="mb-10 text-center">
              <p className="text-on-surface text-xl font-bold">프로필 이미지를 설정해 주세요</p>
              <p className="text-on-surface-variant text-sm mt-2">나를 표현하는 사진을 골라주세요</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-surface-tint/60 mb-8 group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="프로필 미리보기" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center">
                  <CameraIcon size={36} className="text-outline" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon size={24} className="text-white" />
              </div>
            </button>

            <div className="w-full space-y-3">
              <button
                onClick={() => handleAvatarSubmit(false)}
                disabled={!avatarFile || isLoading}
                className="w-full h-14 bg-surface-tint text-on-primary font-bold text-base rounded-xl glow-mint hover:bg-primary-fixed active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? "저장 중..." : "완료"}
              </button>
              <button
                onClick={() => handleAvatarSubmit(true)}
                disabled={isLoading}
                className="w-full h-12 text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors"
              >
                넘어가기
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
