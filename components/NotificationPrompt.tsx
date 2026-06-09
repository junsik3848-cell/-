"use client";

type Props = {
  context: "message" | "post";
  onAllow: () => void;
  onDismiss: () => void;
};

const COPY = {
  message: {
    icon: "💬",
    title: "답장 알림 받기",
    desc: "상대방이 답장을 보내면 바로 알림을 받을 수 있어요.",
  },
  post: {
    icon: "❤️",
    title: "좋아요·댓글 알림 받기",
    desc: "내 조과에 좋아요나 댓글이 달리면 바로 알림을 받을 수 있어요.",
  },
};

export default function NotificationPrompt({ context, onAllow, onDismiss }: Props) {
  const copy = COPY[context];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onDismiss} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-surface-container rounded-t-2xl border-t border-outline-variant/50 p-6 pb-8">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />

        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <span className="text-4xl">{copy.icon}</span>
          <div>
            <p className="text-base font-bold text-on-surface">{copy.title}</p>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{copy.desc}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onAllow}
            className="w-full h-12 bg-surface-tint text-on-primary font-bold text-sm rounded-xl glow-mint hover:bg-primary-fixed transition-colors"
          >
            허용하기
          </button>
          <button
            onClick={onDismiss}
            className="w-full h-11 text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors"
          >
            나중에
          </button>
        </div>
      </div>
    </>
  );
}
