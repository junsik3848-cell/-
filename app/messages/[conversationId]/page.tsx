"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_system: boolean;
  created_at: string;
};

type OtherUser = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export default function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = use(params);
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [other, setOther] = useState<OtherUser | null>(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      const [{ data: conv }, { data: msgs }] = await Promise.all([
        supabase
          .from("conversations")
          .select("user1_id, user2_id")
          .eq("id", conversationId)
          .single(),
        supabase
          .from("messages")
          .select("id, sender_id, content, is_read, is_system, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ]);

      if (!conv) { router.push("/messages"); return; }

      const otherId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
      const { data: otherData } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .eq("id", otherId)
        .single();

      setOther(otherData as OtherUser);
      setMessages((msgs ?? []) as Message[]);
      setIsLoading(false);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("is_read", false)
        .neq("sender_id", user.id);
    }
    load();
  }, [conversationId, router]);

  // Realtime 구독
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // 새 메시지 올 때마다 스크롤 하단
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const content = text.trim();
    if (!content || isSending || !myUserId) return;
    setIsSending(true);
    setText("");

    const supabase = createClient();
    const { data: msg } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: myUserId, content })
      .select("id, sender_id, content, is_read, created_at")
      .single();

    await supabase
      .from("conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (msg) {
      setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg as Message]);
    }
    setIsSending(false);
  }

  const avatar = other?.avatar_url ?? `https://picsum.photos/seed/${other?.username ?? "user"}/80/80`;

  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex flex-col bg-background">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center gap-3 px-3 h-14">
          <button
            onClick={() => router.push("/messages")}
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon size={22} />
          </button>
          {other && (
            <Link href={`/profile/${other.id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
              <img src={avatar} alt={other.username} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              <p className="text-sm font-semibold text-on-surface truncate">{other.username}</p>
            </Link>
          )}
        </div>
      </header>

      {/* 메시지 목록 */}
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center pt-32">
            <div className="w-8 h-8 border-2 border-surface-tint border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 text-center px-8">
            <img src={avatar} alt={other?.username} className="w-16 h-16 rounded-full object-cover mb-3" />
            <p className="text-sm font-semibold text-on-surface">{other?.username}</p>
            <p className="text-xs text-on-surface-variant mt-1">대화를 시작해보세요</p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-2">
            {messages.map((msg, i) => {
              if (msg.is_system) {
                return (
                  <div key={msg.id} className="flex items-center justify-center py-1">
                    <span className="text-xs text-outline bg-surface-container px-3 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const isMe = msg.sender_id === myUserId;
              const showTime =
                i === messages.length - 1 ||
                new Date(messages[i + 1].created_at).getMinutes() !==
                  new Date(msg.created_at).getMinutes();

              const marketMatch = msg.content.match(/^(\[장터 게시글\] )(\/market\/[a-z0-9-]+)$/);

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-surface-tint text-on-primary rounded-br-sm"
                      : "bg-surface-container text-on-surface rounded-bl-sm"
                  }`}>
                    {marketMatch ? (
                      <span>
                        {marketMatch[1]}
                        <Link
                          href={marketMatch[2]}
                          className={`underline underline-offset-2 ${isMe ? "text-on-primary/80 hover:text-on-primary" : "text-surface-tint hover:text-primary-fixed"}`}
                        >
                          게시글 보기
                        </Link>
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {showTime && (
                    <span className="text-[10px] text-outline mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* 입력창 */}
      <div className="flex-shrink-0 bg-surface-container border-t border-outline-variant/30 px-3 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="메시지 입력..."
            className="flex-1 h-10 px-4 rounded-full bg-surface-container-high text-sm text-on-surface placeholder:text-outline focus:outline-none border border-outline-variant/40 focus:border-surface-tint/60 transition-all"
          />
          <button
            onClick={sendMessage}
            onMouseDown={(e) => e.preventDefault()}
            disabled={!text.trim() || isSending}
            className="w-10 h-10 rounded-full bg-surface-tint flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity glow-mint"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-on-primary translate-x-0.5">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
