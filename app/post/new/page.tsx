"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { XIcon, CameraIcon, ImageIcon, TagIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";

type PostType = "catch" | "market" | null;

type CatchForm = {
  images: string[];
  caption: string;
  hashtags: string;
  location: string;
  weight: string;
  length: string;
};

type MarketForm = {
  images: string[];
  title: string;
  price: string;
  category: string;
  location: string;
  description: string;
};

const MARKET_CATEGORIES = [
  { value: "rod", label: "로드" },
  { value: "reel", label: "릴" },
  { value: "lure", label: "루어" },
  { value: "etc", label: "기타" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>(null);
  const [showTypeSheet, setShowTypeSheet] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const catchFileInputRef = useRef<HTMLInputElement>(null);
  const marketFileInputRef = useRef<HTMLInputElement>(null);

  const [catchForm, setCatchForm] = useState<CatchForm>({
    images: [],
    caption: "",
    hashtags: "",
    location: "",
    weight: "",
    length: "",
  });

  const [marketForm, setMarketForm] = useState<MarketForm>({
    images: [],
    title: "",
    price: "",
    category: "rod",
    location: "",
    description: "",
  });

  useEffect(() => {
    const urls = [...catchForm.images, ...marketForm.images];
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function handleFileChange(form: "catch" | "market", files: FileList | null) {
    if (!files) return;
    const compressed = await Promise.all(Array.from(files).map((f) => compressImage(f, "post")));
    const newUrls = compressed.map((f) => URL.createObjectURL(f));
    if (form === "catch") {
      setCatchForm((f) => ({ ...f, images: [...f.images, ...newUrls].slice(0, 5) }));
    } else {
      setMarketForm((f) => ({ ...f, images: [...f.images, ...newUrls].slice(0, 5) }));
    }
  }

  function removeImage(form: "catch" | "market", index: number) {
    if (form === "catch") {
      setCatchForm((f) => {
        URL.revokeObjectURL(f.images[index]);
        return { ...f, images: f.images.filter((_, j) => j !== index) };
      });
    } else {
      setMarketForm((f) => {
        URL.revokeObjectURL(f.images[index]);
        return { ...f, images: f.images.filter((_, j) => j !== index) };
      });
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const images = postType === "catch" ? catchForm.images : marketForm.images;

    // 이미지를 Supabase Storage에 업로드
    const uploadedUrls: string[] = [];
    for (const blobUrl of images) {
      const blob = await fetch(blobUrl).then((r) => r.blob());
      const ext = blob.type.split("/")[1] || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("post-images").upload(path, blob);
      if (!error) {
        const { data } = supabase.storage.from("post-images").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
    }

    // DB에 게시글 저장
    if (postType === "catch") {
      await supabase.from("posts").insert({
        user_id: user.id,
        type: "catch",
        images: uploadedUrls,
        caption: catchForm.caption,
        location: catchForm.location,
        hashtags: catchForm.hashtags,
        weight: catchForm.weight ? parseFloat(catchForm.weight) : null,
        length: catchForm.length ? parseFloat(catchForm.length) : null,
      });
    } else {
      await supabase.from("posts").insert({
        user_id: user.id,
        type: "market",
        images: uploadedUrls,
        title: marketForm.title,
        price: marketForm.price ? parseInt(marketForm.price) : null,
        category: marketForm.category,
        location: marketForm.location,
        description: marketForm.description,
      });
    }

    router.push("/feed");
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/feed" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <XIcon size={22} />
          </Link>
          <h1 className="text-base font-bold text-on-surface">
            {postType === "catch" ? "조과 기록" : postType === "market" ? "장터 등록" : "새 게시글"}
          </h1>
          {postType && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="text-surface-tint text-sm font-bold hover:text-primary-fixed transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "저장 중..." : "게시"}
            </button>
          )}
          {!postType && <div className="w-10" />}
        </div>
      </header>

      <main className="pt-14 pb-6">
        {/* 타입 선택 바텀시트 */}
        {showTypeSheet && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50" />
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto glass-panel rounded-t-2xl border-t border-outline-variant/50 p-5">
              <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
              <h3 className="text-base font-bold text-on-surface mb-1">어떤 글을 작성할까요?</h3>
              <p className="text-xs text-on-surface-variant mb-5">작성 유형을 선택해주세요</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => { setPostType("catch"); setShowTypeSheet(false); }}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-surface-tint/60 hover:bg-surface-tint/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-surface-tint/10 flex items-center justify-center text-2xl group-hover:bg-surface-tint/20 transition-colors">
                    🎣
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-on-surface">조과 기록</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">사진·어종·위치 공유</p>
                  </div>
                </button>

                <button
                  onClick={() => { setPostType("market"); setShowTypeSheet(false); }}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-pink-400/60 hover:bg-pink-400/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-pink-400/10 flex items-center justify-center text-2xl group-hover:bg-pink-400/20 transition-colors">
                    🛒
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-on-surface">장터 등록</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">낚시 장비 중고 거래</p>
                  </div>
                </button>
              </div>

              <Link href="/feed" className="block w-full text-center py-3.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                취소
              </Link>
            </div>
          </>
        )}

        {/* 조과 작성 폼 */}
        {postType === "catch" && (
          <div className="px-4 pt-4 space-y-5">
            {/* 사진 업로드 */}
            <div>
              <input
                ref={catchFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange("catch", e.target.files)}
              />
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {catchForm.images.length < 5 && (
                  <button
                    onClick={() => catchFileInputRef.current?.click()}
                    className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 hover:border-surface-tint/50 transition-colors"
                  >
                    <CameraIcon size={22} className="text-outline" />
                    <span className="text-[10px] text-outline">사진 추가</span>
                  </button>
                )}
                {catchForm.images.map((img, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={img} alt="" className="w-24 h-24 rounded-xl object-cover" />
                    <button
                      onClick={() => removeImage("catch", i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error rounded-full flex items-center justify-center"
                    >
                      <XIcon size={10} className="text-on-error" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 어종 데이터 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">무게 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="예: 2.4"
                  value={catchForm.weight}
                  onChange={(e) => setCatchForm((f) => ({ ...f, weight: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">길이 (cm)</label>
                <input
                  type="number"
                  placeholder="예: 52"
                  value={catchForm.length}
                  onChange={(e) => setCatchForm((f) => ({ ...f, length: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
                />
              </div>
            </div>

            {/* 위치 */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">낚시 포인트</label>
              <input
                type="text"
                placeholder="예: 충주호, 소양강..."
                value={catchForm.location}
                onChange={(e) => setCatchForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
              />
            </div>

            {/* 본문 */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">내용</label>
              <textarea
                rows={4}
                placeholder="오늘의 조황을 공유해주세요..."
                value={catchForm.caption}
                onChange={(e) => setCatchForm((f) => ({ ...f, caption: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all resize-none"
              />
            </div>

            {/* 해시태그 */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide flex items-center gap-1.5">
                <TagIcon size={12} />해시태그
              </label>
              <input
                type="text"
                placeholder="#배스낚시 #충주호 #LUNKER"
                value={catchForm.hashtags}
                onChange={(e) => setCatchForm((f) => ({ ...f, hashtags: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 bg-surface-tint text-on-primary font-bold text-sm rounded-lg glow-mint hover:bg-primary-fixed transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "게시 중..." : "조과 기록 게시하기"}
            </button>
          </div>
        )}

        {/* 장터 작성 폼 */}
        {postType === "market" && (
          <div className="px-4 pt-4 space-y-5">
            {/* 사진 */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-2 tracking-wide">
                상품 사진 (최대 5장)
              </label>
              <input
                ref={marketFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange("market", e.target.files)}
              />
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {marketForm.images.length < 5 && (
                  <button
                    onClick={() => marketFileInputRef.current?.click()}
                    className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 hover:border-surface-tint/50 transition-colors"
                  >
                    <ImageIcon size={22} className="text-outline" />
                    <span className="text-[10px] text-outline">추가</span>
                  </button>
                )}
                {marketForm.images.map((img, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={img} alt="" className="w-24 h-24 rounded-xl object-cover" />
                    <button
                      onClick={() => removeImage("market", i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error rounded-full flex items-center justify-center"
                    >
                      <XIcon size={10} className="text-on-error" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">상품명</label>
              <input
                type="text"
                placeholder="예: 시마노 메타니움 HG 거의 신품"
                value={marketForm.title}
                onChange={(e) => setMarketForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
              />
            </div>

            {/* 가격 + 카테고리 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">가격 (원)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={marketForm.price}
                  onChange={(e) => setMarketForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">카테고리</label>
                <select
                  value={marketForm.category}
                  onChange={(e) => setMarketForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-surface-tint transition-all appearance-none"
                >
                  {MARKET_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-surface-container">{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 거래 위치 */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">거래 지역</label>
              <input
                type="text"
                placeholder="예: 서울 강남, 경기 성남..."
                value={marketForm.location}
                onChange={(e) => setMarketForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5 tracking-wide">상품 설명</label>
              <textarea
                rows={4}
                placeholder="상품 상태, 구매 시기, 하자 유무 등을 자세히 적어주세요..."
                value={marketForm.description}
                onChange={(e) => setMarketForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-surface-tint transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 bg-surface-tint text-on-primary font-bold text-sm rounded-lg glow-mint hover:bg-primary-fixed transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "게시 중..." : "장터 글 등록하기"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
