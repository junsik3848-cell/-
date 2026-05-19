export type Post = {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    isFollowing?: boolean;
  };
  location: string;
  image: string;
  fish: { weight: number; length: number } | null;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
};

export type Comment = {
  id: string;
  user: { username: string; avatar: string };
  text: string;
  likes: number;
  createdAt: string;
};

export type MarketPost = {
  id: string;
  user: { username: string; avatar: string };
  title: string;
  price: number;
  category: "rod" | "reel" | "lure" | "etc";
  status: "selling" | "reserved" | "sold";
  image: string;
  location: string;
  description: string;
  createdAt: string;
};

export type Marker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  type: "rock" | "weed" | "bridge" | "dock" | "inlet";
  reports: number;
};

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    user: { id: "u1", username: "bass_hunter_99", avatar: "https://picsum.photos/seed/user1/80/80", isFollowing: false },
    location: "충주호 (ChungJu Lake)",
    image: "https://picsum.photos/seed/bass1/600/800",
    fish: { weight: 2.4, length: 52 },
    caption: "오늘 충주호에서 인생 배스 잡았습니다! 릴이 이참 아니네요 🎣 #LUNKER #배스낚시 #충주호",
    hashtags: ["LUNKER", "배스낚시", "충주호"],
    likes: 128,
    comments: 14,
    isLiked: false,
    isBookmarked: false,
    createdAt: "2시간 전",
  },
  {
    id: "2",
    user: { id: "u2", username: "ProAngler_Jaxon", avatar: "https://picsum.photos/seed/user2/80/80", isFollowing: true },
    location: "Lake Okeechobee",
    image: "https://picsum.photos/seed/bass2/600/800",
    fish: { weight: 3.8, length: 61 },
    caption: "Personal best largemouth out on the lake this morning! Hit a topwater frog right at sunrise. The fight was unreal, completely choked the bait. 🔥 #bass #fishing #PB",
    hashtags: ["bass", "fishing", "PB"],
    likes: 2405,
    comments: 128,
    isLiked: true,
    isBookmarked: true,
    createdAt: "2h ago",
  },
  {
    id: "3",
    user: { id: "u3", username: "소양강_김낚시", avatar: "https://picsum.photos/seed/user3/80/80" },
    location: "소양강 댐",
    image: "https://picsum.photos/seed/bass3/600/800",
    fish: { weight: 1.9, length: 46 },
    caption: "소양강 조황 최고입니다 오늘도 득어 💪 새벽 4시부터 나왔는데 보람 있네요 #소양강 #배스 #새벽낚시",
    hashtags: ["소양강", "배스", "새벽낚시"],
    likes: 89,
    comments: 7,
    isLiked: false,
    isBookmarked: false,
    createdAt: "5시간 전",
  },
  {
    id: "4",
    user: { id: "u4", username: "bass_master_kr", avatar: "https://picsum.photos/seed/user4/80/80" },
    location: "남한강 여주",
    image: "https://picsum.photos/seed/bass4/600/800",
    fish: { weight: 3.1, length: 58 },
    caption: "여주 남한강에서 드디어 3kg 넘겼습니다! 텍사스 리그로 바텀 긁다가 걸렸어요 😤 #남한강 #배스낚시 #빅배스",
    hashtags: ["남한강", "배스낚시", "빅배스"],
    likes: 341,
    comments: 33,
    isLiked: true,
    isBookmarked: false,
    createdAt: "어제",
  },
];

export const MOCK_COMMENTS: Comment[] = [
  { id: "c1", user: { username: "angler_pro", avatar: "https://picsum.photos/seed/cu1/40/40" }, text: "와 정말 부럽네요! 채비 뭐 쓰셨어요?", likes: 4, createdAt: "1시간 전" },
  { id: "c2", user: { username: "fishlover_kr", avatar: "https://picsum.photos/seed/cu2/40/40" }, text: "충주호 요즘 잘 나오나요? 다음 주 갈 예정인데 😮", likes: 2, createdAt: "1시간 전" },
  { id: "c3", user: { username: "bass_hunter_99", avatar: "https://picsum.photos/seed/user1/40/40" }, text: "@fishlover_kr 지금 최고예요! 수온이 딱 맞아서 입질이 많아요 🎣", likes: 1, createdAt: "30분 전" },
  { id: "c4", user: { username: "jiglover", avatar: "https://picsum.photos/seed/cu3/40/40" }, text: "무게가 어마어마하네요 채비 공유 부탁드립니다!", likes: 0, createdAt: "15분 전" },
];

export const MOCK_MARKET_POSTS: MarketPost[] = [
  { id: "m1", user: { username: "bass_hunter_99", avatar: "https://picsum.photos/seed/user1/40/40" }, title: "시마노 메타니움 MGL HG 거의 신품", price: 320000, category: "reel", status: "selling", image: "https://picsum.photos/seed/gear1/400/400", location: "서울 강남", description: "작년에 구매해서 3번 정도 사용했습니다. 드랙 이상 없음. 박스 포함 판매.", createdAt: "1일 전" },
  { id: "m2", user: { username: "ProAngler_Jaxon", avatar: "https://picsum.photos/seed/user2/40/40" }, title: "게리야마모토 슬렌더 그럽 루어 세트", price: 45000, category: "lure", status: "selling", image: "https://picsum.photos/seed/gear2/400/400", location: "경기 성남", description: "색상별로 10개 세트. 사용감 있으나 사용 가능한 상태.", createdAt: "2일 전" },
  { id: "m3", user: { username: "소양강_김낚시", avatar: "https://picsum.photos/seed/user3/40/40" }, title: "심가 스피닝 로드 7피트 ML", price: 180000, category: "rod", status: "reserved", image: "https://picsum.photos/seed/gear3/400/400", location: "강원 춘천", description: "가이드 교체했고 블랭크 이상 없습니다. 케이스 포함.", createdAt: "3일 전" },
  { id: "m4", user: { username: "bass_master_kr", avatar: "https://picsum.photos/seed/user4/40/40" }, title: "OSP 벤토 130F 미러링 색상", price: 28000, category: "lure", status: "selling", image: "https://picsum.photos/seed/gear4/400/400", location: "경기 여주", description: "2회 사용. 훅 교체 필요. 가격 협의 가능.", createdAt: "4일 전" },
  { id: "m5", user: { username: "topwater_fan", avatar: "https://picsum.photos/seed/user5/40/40" }, title: "다이와 타토라 베이트 릴 100XH", price: 250000, category: "reel", status: "selling", image: "https://picsum.photos/seed/gear5/400/400", location: "충북 충주", description: "시즌 종료로 판매합니다. 기어음 없음, 클린 상태.", createdAt: "5일 전" },
  { id: "m6", user: { username: "frog_master", avatar: "https://picsum.photos/seed/user6/40/40" }, title: "수초 전용 텍사스 리그 세트 + 웜", price: 35000, category: "etc", status: "sold", image: "https://picsum.photos/seed/gear6/400/400", location: "전남 나주", description: "수초치기 입문 세트. 신코, 사와무라 등 포함.", createdAt: "1주 전" },
];

export const MOCK_MARKERS: Marker[] = [
  { id: "mk1", lat: 37.0, lng: 127.9, title: "충주댐 상류 수초대", description: "수초가 밀집한 포인트. 봄~여름 호황.", type: "weed", reports: 24 },
  { id: "mk2", lat: 37.02, lng: 127.92, title: "충주호 암반 지대", description: "대물 배스 출몰 지역. 드랍샷 효과적.", type: "rock", reports: 18 },
  { id: "mk3", lat: 36.98, lng: 127.88, title: "남한강 교각 밑", description: "그늘과 조류가 만나는 핫스팟.", type: "bridge", reports: 31 },
  { id: "mk4", lat: 37.01, lng: 127.85, title: "소양강 선착장", description: "새벽 조황 최고. 플리킹 추천.", type: "dock", reports: 12 },
  { id: "mk5", lat: 37.05, lng: 127.95, title: "청평호 유입구", description: "먹이 활동 활발. 스피너베이트 유효.", type: "inlet", reports: 9 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  rod: "로드",
  reel: "릴",
  lure: "루어",
  etc: "기타",
};

export const STATUS_LABELS: Record<string, string> = {
  selling: "판매중",
  reserved: "예약중",
  sold: "거래완료",
};
