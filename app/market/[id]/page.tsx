"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import ImageCarousel from "@/components/ImageCarousel";
import { ArrowLeftIcon, MoreVerticalIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import ReportSheet from "@/components/ReportSheet";

const CATEGORY_LABELS: Record<string, string> = {
  rod: "로드",
  reel: "릴",
  lure: "루어",
  etc: "기타",
};

const STATUS_LABELS: Record<string, string> = {
  selling: "판매중",
  reserved: "예약중",
  sold: "거래완료",
};

const STATUS_STYLES: Record<string, string> = {
  selling: "bg-surface-tint/20 text-surface-tint border-surface-tint/40",
  reserved: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  sold: "bg-surface-container-high text-outline border-outline-variant",
};

const STATUSES = ["selling", "reserved", "sold"] as const;

type MarketPost = {
  id: string;
  user_id: string;
  images: string[];
  title: string | null;
  price: number | null;
  category: string | null;
  location: string | null;
  description: string | null;
  status: string;
  created_at: string;
  users: { username: string; avatar_url: string | null };
};

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<MarketPost | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [status, setStatus] = useState("selling");
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: { user } }, { data: postData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("posts")
          .select("id, user_id, images, title, price, category, location, description, status, created_at, users(username, avatar_url)")
          .eq("id", id)
          .eq("type", "market")
          .single(),
      ]);

      if (!postData) { router.push("/market"); return; }
      setPost(postData as unknown as MarketPost);
      setStatus(postData.status ?? "selling");
      setMyUserId(user?.id ?? null);
      setIsLoading(false);
    }
    load();
  }, [id, router]);

  async function handleChat() {
    if (!myUserId) { router.push("/login"); return; }
    if (!post || myUserId === post.user_id) return;
    setIsChatting(true);
    const supabase = createClient();
    const [u1, u2] = [myUserId, post.user_id].sort();
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("user1_id", u1)
      .eq("user2_id", u2)
      .maybeSingle();
    let convId = existing?.id;
    if (!convId) {
      const { data } = await supabase
        .from("conversations")
        .insert({ user1_id: u1, user2_id: u2 })
        .select("id")
        .single();
      convId = data!.id;
    }
    // 마켓 게시글 URL 자동 전송
    const autoMsg = `[장터 게시글] /market/${id}`;
    await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: myUserId,
      content: autoMsg,
    });
    await supabase
      .from("conversations")
      .update({ last_message: autoMsg, last_message_at: new Date().toISOString() })
      .eq("id", convId);
    router.push(`/messages/${convId}`);
  }

  async function updateStatus(newStatus: string) {
    const supabase = createClient();
    await supabase.from("posts").update({ status: newStatus }).eq("id", id);
    setStatus(newStatus);
    setShowStatusSheet(false);
  }

  async function handleDelete() {
    if (!myUserId || myUserId !== post?.user_id) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", id).eq("user_id", myUserId);
    router.push("/market");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  const isOwner = myUserId === post.user_id;
  const authorAvatar = post.users.avatar_url ?? `https://picsum.photos/seed/${post.users.username}/80/80`;
  const timeLabel = new Date(post.created_at).toLocaleDateString("ko-KR").replace(/\.$/, "");

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/market" className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeftIcon size={22} />
          </Link>
          <h1 className="font-brand text-xl font-bold tracking-widest text-surface-tint">LUNKER</h1>
          {isOwner ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <MoreVerticalIcon size={22} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-11 z-50 w-44 glass-panel rounded-xl border border-outline-variant/50 py-1 shadow-xl">
                    <button
                      onClick={() => { setShowMenu(false); setShowStatusSheet(true); }}
                      className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                    >
                      판매 상태 변경
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      className="w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-container transition-colors"
                    >
                      게시글 삭제하기
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <MoreVerticalIcon size={22} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-11 z-50 w-44 glass-panel rounded-xl border border-outline-variant/50 py-1 shadow-xl">
                    <button
                      onClick={() => { setShowMenu(false); setShowReport(true); }}
                      className="w-full text-left px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      신고하기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="pt-14 pb-28">
        {/* 이미지 */}
        {post.images.length > 0 ? (
          <ImageCarousel images={post.images} />
        ) : (
          <div className="aspect-square w-full bg-surface-container flex items-center justify-center">
            <p className="text-outline text-sm">이미지 없음</p>
          </div>
        )}

        {/* 상품 정보 */}
        <div className="px-4 py-5 border-b border-outline-variant/30">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-on-surface flex-1">{post.title ?? "제목 없음"}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
          <p className="text-2xl font-bold text-surface-tint mt-3 font-brand">
            {post.price != null ? post.price.toLocaleString() : "가격 미정"}
            {post.price != null && <span className="text-base font-normal text-on-surface-variant ml-1">원</span>}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-outline flex-wrap">
            {post.category && (
              <span className="px-2 py-1 bg-surface-container rounded">
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
            )}
            {post.location && <span>📍 {post.location}</span>}
            <span>{timeLabel}</span>
          </div>
        </div>

        {/* 판매자 */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-outline-variant/30">
          <Link href={`/profile/${post.user_id}`}>
            <img
              src={authorAvatar}
              alt={post.users.username}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-outline-variant"
            />
          </Link>
          <div className="flex-1">
            <p className="text-sm font-semibold text-on-surface">{post.users.username}</p>
            <p className="text-xs text-on-surface-variant">판매자</p>
          </div>
          <Link
            href={`/profile/${post.user_id}`}
            className="text-xs text-surface-tint font-medium hover:text-primary-fixed transition-colors"
          >
            프로필 보기
          </Link>
        </div>

        {/* 상품 설명 */}
        {post.description && (
          <div className="px-4 py-5">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">상품 설명</h3>
            <p className="text-sm text-on-surface leading-relaxed">{post.description}</p>
          </div>
        )}
      </main>

      {/* 구매 CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-t border-outline-variant/30 px-4 py-3">
        <button
          onClick={status !== "sold" && !isOwner ? handleChat : undefined}
          disabled={status === "sold" || isChatting || isOwner}
          className="w-full h-12 rounded-lg bg-surface-tint text-on-primary font-bold text-sm glow-mint hover:bg-primary-fixed transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isChatting ? "연결 중..." : status === "sold" ? "거래 완료" : status === "reserved" ? "예약중" : isOwner ? "내 게시글" : "채팅으로 거래하기"}
        </button>
      </div>

      {/* 판매 상태 변경 바텀시트 */}
      {showStatusSheet && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowStatusSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto glass-panel rounded-t-2xl border-t border-outline-variant/50 p-5">
            <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />
            <h3 className="text-base font-bold text-on-surface mb-4">판매 상태 변경</h3>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`w-full text-left px-4 py-3.5 rounded-lg mb-2 flex items-center justify-between transition-all ${
                  status === s
                    ? "bg-surface-tint/15 border border-surface-tint/40"
                    : "bg-surface-container border border-transparent"
                }`}
              >
                <span className={`text-sm font-medium ${status === s ? "text-surface-tint" : "text-on-surface"}`}>
                  {STATUS_LABELS[s]}
                </span>
                {status === s && <span className="text-surface-tint text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}

      {showReport && (
        <ReportSheet
          postId={id}
          postType="market"
          onClose={() => setShowReport(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}
