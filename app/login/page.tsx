import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/seed/darkwater/800/1200"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 p-5 pt-12">
        <Link
          href="/feed"
          className="w-11 h-11 flex items-center justify-center rounded-full glass-panel text-on-surface hover:text-surface-tint transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-5 w-full max-w-md mx-auto pb-12">
        {/* 로고 */}
        <div className="mb-12 text-center w-full">
          <h1 className="font-brand text-5xl font-bold tracking-tight bg-gradient-to-r from-surface-tint to-secondary bg-clip-text text-transparent pb-1">
            LUNKER
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">프로 앵글러를 위한 여정의 시작</p>
        </div>

        {/* 로그인 폼 */}
        <form className="w-full space-y-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-2 tracking-wider uppercase">
              이메일 주소
            </label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              className="w-full h-14 px-4 rounded bg-surface-container/60 backdrop-blur-sm border border-outline-variant text-on-surface placeholder:text-outline text-sm focus:outline-none focus:border-surface-tint focus:ring-1 focus:ring-surface-tint transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-2 tracking-wider uppercase">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="w-full h-14 px-4 rounded bg-surface-container/60 backdrop-blur-sm border border-outline-variant text-on-surface placeholder:text-outline text-sm focus:outline-none focus:border-surface-tint focus:ring-1 focus:ring-surface-tint transition-all"
            />
          </div>

          <Link
            href="/feed"
            className="block w-full h-14 bg-surface-tint text-on-primary font-bold text-sm rounded flex items-center justify-center mt-6 glow-mint hover:bg-primary-fixed transition-colors"
          >
            로그인
          </Link>
        </form>

        {/* 구분선 */}
        <div className="w-full flex items-center gap-4 my-7">
          <div className="h-px flex-1 bg-outline-variant" />
          <span className="text-xs text-outline">또는</span>
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        {/* 구글 로그인 */}
        <Link
          href="/feed"
          className="w-full h-14 glass-panel rounded flex items-center justify-center gap-3 text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
        >
          <GoogleIcon />
          구글로 시작하기
        </Link>

        {/* 푸터 링크 */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-on-surface-variant">
          <a href="#" className="hover:text-surface-tint transition-colors">비밀번호 찾기</a>
          <div className="w-1 h-1 rounded-full bg-outline-variant" />
          <a href="#" className="hover:text-surface-tint transition-colors">회원가입</a>
        </div>
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
