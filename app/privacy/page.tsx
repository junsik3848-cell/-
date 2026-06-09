import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | LUNKER",
};

const LAST_UPDATED = "2026년 6월 9일";
const EFFECTIVE_DATE = "2026년 6월 9일";
const CONTACT_EMAIL = "junsik3848@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <header className="sticky top-0 z-40 bg-surface-container border-b border-outline-variant/30">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/login"
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-on-surface">개인정보처리방침</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-8 pb-16 text-sm text-on-surface leading-relaxed">
        <div className="text-xs text-on-surface-variant">
          <p>시행일: {EFFECTIVE_DATE}</p>
          <p className="mt-0.5">최종 수정일: {LAST_UPDATED}</p>
        </div>

        <p className="text-on-surface-variant leading-relaxed">
          LUNKER(이하 "서비스")는 배스 낚시 커뮤니티 앱으로, 이용자의 개인정보를 소중히 여깁니다. 본 방침은 수집하는 정보와 이용 목적을 명확히 안내합니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <SubSection title="가. 회원가입 및 로그인 시 (소셜 로그인)">
            <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
              <li>Google 로그인: 이메일 주소, 이름, 프로필 사진 URL</li>
              <li>카카오 로그인: 이메일 주소, 닉네임, 프로필 사진 URL</li>
            </ul>
          </SubSection>
          <SubSection title="나. 서비스 이용 중 이용자가 직접 입력">
            <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
              <li>닉네임(사용자명)</li>
              <li>게시글: 사진, 낚시 위치, 조과 정보(무게·길이), 해시태그, 캡션</li>
              <li>장터 게시글: 상품 사진, 가격, 설명, 거래 지역</li>
              <li>댓글 및 다이렉트 메시지(DM) 내용</li>
              <li>프로필 사진</li>
            </ul>
          </SubSection>
          <SubSection title="다. 서비스 이용 중 자동 수집">
            <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
              <li>푸시 알림 구독 정보(Web Push 토큰): 알림 수신 시에만 수집, 거부 가능</li>
              <li>서비스 이용 기록(접속 시간 등): Supabase/Vercel 서버 로그</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="2. 개인정보 수집 및 이용 목적">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50">
                <th className="text-left py-2 pr-3 text-on-surface-variant font-semibold w-2/5">수집 항목</th>
                <th className="text-left py-2 text-on-surface-variant font-semibold">이용 목적</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {[
                ["이메일, 이름, 프로필 사진", "회원 식별 및 계정 관리"],
                ["닉네임", "커뮤니티 내 사용자 표시"],
                ["게시글·댓글·DM", "커뮤니티 서비스 제공"],
                ["낚시 위치", "지도 핀 및 조과 기록 표시"],
                ["푸시 토큰", "알림 발송 (DM·좋아요·댓글·팔로우)"],
              ].map(([item, purpose]) => (
                <tr key={item}>
                  <td className="py-2 pr-3 text-on-surface-variant">{item}</td>
                  <td className="py-2 text-on-surface-variant">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="3. 개인정보 보유 및 이용 기간">
          <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
            <li><strong className="text-on-surface">회원 탈퇴 시:</strong> 즉시 삭제 (단, 관련 법령에서 보관을 요구하는 경우 해당 기간 보관)</li>
            <li><strong className="text-on-surface">푸시 토큰:</strong> 알림 수신 거부 또는 탈퇴 시 즉시 삭제</li>
            <li><strong className="text-on-surface">서버 로그:</strong> 최대 30일 보관 후 자동 삭제</li>
          </ul>
          <p className="mt-3 text-on-surface-variant">
            관련 법령에 따른 보관 의무가 있는 경우에는 해당 기간 동안 보관합니다.
          </p>
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p className="text-on-surface-variant">
            서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-on-surface-variant">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차에 따라 요청이 있는 경우</li>
          </ul>
        </Section>

        <Section title="5. 개인정보 처리 위탁">
          <p className="text-on-surface-variant mb-3">서비스 운영을 위해 아래 업체에 일부 업무를 위탁합니다.</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50">
                <th className="text-left py-2 pr-3 text-on-surface-variant font-semibold">수탁업체</th>
                <th className="text-left py-2 text-on-surface-variant font-semibold">위탁 업무</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {[
                ["Supabase Inc.", "데이터베이스 및 파일 스토리지 운영"],
                ["Vercel Inc.", "웹 서비스 호스팅"],
                ["Google LLC", "소셜 로그인 인증"],
                ["Kakao Corp.", "소셜 로그인 인증"],
                ["NAVER Corp.", "지도 서비스 제공"],
              ].map(([company, task]) => (
                <tr key={company}>
                  <td className="py-2 pr-3 text-on-surface-variant">{company}</td>
                  <td className="py-2 text-on-surface-variant">{task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="6. 이용자의 권리">
          <p className="text-on-surface-variant">이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-on-surface-variant">
            <li>본인 개인정보 열람 요청</li>
            <li>오류가 있는 경우 정정 요청</li>
            <li>삭제 요청 (탈퇴를 통한 즉시 삭제)</li>
            <li>처리 정지 요청</li>
            <li>푸시 알림 수신 거부 (앱 내 알림 설정에서 직접 변경 가능)</li>
          </ul>
          <p className="mt-3 text-on-surface-variant">
            권리 행사는 아래 연락처로 요청하시면 지체 없이 조치합니다.
          </p>
        </Section>

        <Section title="7. 개인정보의 안전성 확보 조치">
          <ul className="list-disc pl-4 space-y-1 text-on-surface-variant">
            <li>HTTPS 암호화 통신</li>
            <li>Row Level Security(RLS)를 통한 데이터 접근 제어</li>
            <li>비밀번호 미보관 (소셜 로그인 전용)</li>
            <li>불필요한 개인정보 최소 수집 원칙</li>
          </ul>
        </Section>

        <Section title="8. 개인정보 보호책임자">
          <div className="bg-surface-container rounded-xl p-4 space-y-1 text-on-surface-variant">
            <p><span className="text-on-surface font-semibold">담당자:</span> LUNKER 운영팀</p>
            <p>
              <span className="text-on-surface font-semibold">이메일:</span>{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-surface-tint hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <p className="mt-3 text-on-surface-variant">
            개인정보 관련 문의, 불만 처리, 피해 구제 등에 관한 사항은 위 연락처로 문의해 주세요.
          </p>
        </Section>

        <Section title="9. 방침 변경 안내">
          <p className="text-on-surface-variant">
            본 개인정보처리방침이 변경될 경우, 시행 7일 전부터 앱 내 공지사항을 통해 공지합니다.
          </p>
        </Section>

        <div className="pt-4 border-t border-outline-variant/30 text-xs text-outline text-center">
          본 방침은 {EFFECTIVE_DATE}부터 적용됩니다.
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-on-surface">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-semibold text-on-surface">{title}</h3>
      {children}
    </div>
  );
}
