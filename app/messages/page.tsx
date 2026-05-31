"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowLeftIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_message_at: string;
  other: { id: string; username: string; avatar_url: string | null };
};

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      const { data: myData } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();
      setMyUsername(myData?.username ?? null);

      const { data } = await supabase
        .from("conversations")
        .select("id, user1_id, user2_id, last_message, last_message_at")
        .or(`and(user1_id.eq.${user.id},deleted_by_user1.eq.false),and(user2_id.eq.${user.id},deleted_by_user2.eq.false)`)
        .order("last_message_at", { ascending: false });

      if (!data || data.length === 0) {
        setIsLoading(false);
        return;
      }

      const otherIds = data.map((c) =>
        c.user1_id === user.id ? c.user2_id : c.user1_id
      );

      const { data: usersData } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .in("id", otherIds);

      const usersMap = new Map((usersData ?? []).map((u) => [u.id, u]));

      setConversations(data.map((c) => {
        const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id;
        const other = usersMap.get(otherId) ?? { id: otherId, username: "알 수 없음", avatar_url: null };
        return { ...c, other };
      }));
      setIsLoading(false);
    }
    load();
  }, [router]);

  async function deleteConversation(convId: string) {
    if (!myUserId || !myUsername) return;
    const supabase = createClient();

    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    const isUser1 = conv.user1_id === myUserId;
    const leaveMsg = `${myUsername}님이 대화를 나갔습니다.`;

    await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: myUserId,
      content: leaveMsg,
      is_system: true,
    });

    await supabase
      .from("conversations")
      .update({
        [isUser1 ? "deleted_by_user1" : "deleted_by_user2"]: true,
        last_message: leaveMsg,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", convId);

    setConversations((prev) => prev.filter((c) => c.id !== convId));
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => { setEditMode(false); router.push("/feed"); }}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeftIcon size={22} />
          </button>
          <h1 className="text-base font-bold text-on-surface">메시지</h1>
          {conversations.length > 0 ? (
            <button
              onClick={() => setEditMode((v) => !v)}
              className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-surface-tint hover:text-primary-fixed transition-colors"
            >
              {editMode ? "완료" : "편집"}
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      <main className="pt-14 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center pt-32">
            <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-outline">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-on-surface mb-2">아직 대화가 없어요</p>
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              다른 앵글러와 대화를 시작해 보세요
            </p>
            <Link
              href="/feed"
              className="px-8 py-3 bg-surface-tint text-on-primary text-sm font-bold rounded-xl glow-mint hover:bg-primary-fixed transition-colors"
            >
              소통 시작하기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {conversations.map((conv) => {
              const avatar = conv.other.avatar_url ?? `https://picsum.photos/seed/${conv.other.username}/80/80`;
              const timeLabel = new Date(conv.last_message_at).toLocaleDateString("ko-KR", {
                month: "numeric", day: "numeric",
              }).replace(/\.$/, "");

              return (
                <div key={conv.id} className="flex items-center overflow-hidden">
                  {/* 삭제 버튼 */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center transition-all duration-200 ease-out ${
                      editMode ? "w-16 opacity-100" : "w-0 opacity-0"
                    }`}
                  >
                    <button
                      onClick={() => deleteConversation(conv.id)}
                      className="w-8 h-8 rounded-full bg-error flex items-center justify-center"
                    >
                      <svg width="14" height="3" viewBox="0 0 14 3" fill="white">
                        <rect x="0" y="0.5" width="14" height="2" rx="1" />
                      </svg>
                    </button>
                  </div>

                  {/* 대화 항목 */}
                  {editMode ? (
                    <div className="flex items-center gap-3.5 px-4 py-4 flex-1 min-w-0">
                      <img
                        src={avatar}
                        alt={conv.other.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-on-surface truncate">{conv.other.username}</p>
                          <span className="text-xs text-outline flex-shrink-0">{timeLabel}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant truncate mt-0.5">
                          {conv.last_message ?? "대화를 시작하세요"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/messages/${conv.id}`}
                      className="flex items-center gap-3.5 px-4 py-4 hover:bg-surface-container transition-colors flex-1 min-w-0"
                    >
                      <img
                        src={avatar}
                        alt={conv.other.username}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-on-surface truncate">{conv.other.username}</p>
                          <span className="text-xs text-outline flex-shrink-0">{timeLabel}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant truncate mt-0.5">
                          {conv.last_message ?? "대화를 시작하세요"}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
