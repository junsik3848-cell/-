"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REASONS = [
  "사기 의심",
  "허위 정보",
  "욕설 / 비방",
  "불법 게시물",
  "기타",
];

type Props = {
  postId: string;
  postType: "catch" | "market";
  onClose: () => void;
};

type Step = "reason" | "detail" | "done";

export default function ReportSheet({ postId, postType, onClose }: Props) {
  const [step, setStep] = useState<Step>("reason");
  const [selectedReason, setSelectedReason] = useState("");
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selectedReason || isSubmitting) return;
    setIsSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSubmitting(false); return; }

    await supabase.from("reports").insert({
      reporter_id: user.id,
      post_id: postId,
      post_type: postType,
      reason: selectedReason,
      detail: detail.trim() || null,
    });

    // 관리자 이메일 알림 (fire-and-forget)
    supabase.functions.invoke("send-report-email", {
      body: {
        postId,
        postType,
        reason: selectedReason,
        detail: detail.trim() || null,
        reporterUserId: user.id,
      },
    });

    setStep("done");
    setIsSubmitting(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={step !== "done" ? onClose : undefined} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-surface-container rounded-t-2xl border-t border-outline-variant/50 p-5 pb-8">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-5" />

        {step === "reason" && (
          <>
            <h3 className="text-base font-bold text-on-surface mb-1">신고 사유 선택</h3>
            <p className="text-xs text-on-surface-variant mb-4">해당하는 사유를 선택해 주세요</p>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedReason === r
                      ? "bg-error/10 border-error/50 text-error"
                      : "bg-surface-container-high border-transparent text-on-surface hover:border-outline-variant/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedReason && setStep("detail")}
              disabled={!selectedReason}
              className="w-full h-12 mt-4 bg-error text-white font-bold text-sm rounded-xl disabled:opacity-40 transition-opacity"
            >
              다음
            </button>
          </>
        )}

        {step === "detail" && (
          <>
            <h3 className="text-base font-bold text-on-surface mb-1">추가 설명 (선택)</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              <span className="text-error font-semibold">{selectedReason}</span>으로 신고합니다
            </p>
            <textarea
              rows={4}
              placeholder="구체적인 내용을 입력해주세요 (선택사항)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              maxLength={300}
              className="w-full px-3 py-3 rounded-xl bg-surface-container-high border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-error/50 transition-all resize-none"
            />
            <p className="text-right text-xs text-outline mt-1">{detail.length}/300</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setStep("reason")}
                className="flex-1 h-12 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-medium"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-50"
              >
                {isSubmitting ? "제출 중..." : "신고하기"}
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center text-center py-4 gap-3">
            <span className="text-4xl">✅</span>
            <p className="text-base font-bold text-on-surface">신고가 접수됐어요</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              검토 후 적절한 조치를 취할게요.<br />소중한 제보 감사합니다.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full h-12 bg-surface-tint text-on-primary font-bold text-sm rounded-xl"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </>
  );
}
