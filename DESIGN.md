---
name: Pro-Angler Elite
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cbc1'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#83958c'
  outline-variant: '#3a4a43'
  surface-tint: '#00e1ab'
  primary: '#fbfffa'
  on-primary: '#003828'
  primary-container: '#00ffc2'
  on-primary-container: '#007255'
  inverse-primary: '#006c50'
  secondary: '#aecdc5'
  on-secondary: '#183530'
  secondary-container: '#2f4c46'
  on-secondary-container: '#9cbcb4'
  tertiary: '#fffdff'
  on-tertiary: '#2e3135'
  tertiary-container: '#e0e1e7'
  on-tertiary-container: '#616469'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#36ffc4'
  primary-fixed-dim: '#00e1ab'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513c'
  secondary-fixed: '#c9e9e1'
  secondary-fixed-dim: '#aecdc5'
  on-secondary-fixed: '#02201b'
  on-secondary-fixed-variant: '#2f4c46'
  tertiary-fixed: '#e1e2e8'
  tertiary-fixed-dim: '#c5c6cc'
  on-tertiary-fixed: '#191c20'
  on-tertiary-fixed-variant: '#44474b'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter-md: 16px
  section-gap: 40px
  card-padding: 16px
---

## Brand & Style

이 디자인 시스템은 'LUNKER'를 사용하는 전문 앵글러들을 위한 프리미엄 경험을 지향합니다. 단순한 취미를 넘어, 기술과 장비에 투자하는 '프로(Pro)'의 감성을 자극하기 위해 **글래스모피즘(Glassmorphism)**과 **미니멀리즘(Minimalism)**을 결합했습니다.

전체적인 분위기는 심해의 고요함과 최첨단 낚시 장비의 정교함을 시각화합니다. 반투명한 레이어와 정밀한 타이포그래피를 통해 사용자가 필드(낚시터)에서도 전문적인 도구를 다루는 듯한 만족감을 느낄 수 있도록 설계되었습니다. 신뢰성(Trust), 정교함(Precision), 그리고 자연과의 조화(Harmony)를 핵심 가치로 삼습니다.

## Colors

전문적인 '에메랄드(Emerald)' 테마를 적용하여 깊은 수심의 어두운 톤과 수면 위로 빛나는 민트색 포인트의 대비를 강조합니다.

- **Primary (Mint Emerald):** 주요 액션 버튼, 로고, 핵심 지표에 사용하여 높은 가시성과 기술적인 느낌을 제공합니다.
- **Secondary (Deep Forest):** 컴포넌트의 배경이나 강조되지 않은 영역에 사용하여 입체감을 부여합니다.
- **Background (Deep Charcoal):** 눈의 피로를 최소화하는 깊은 검은색 계열을 사용하여 콘텐츠(사진 및 데이터)가 돋보이게 합니다.
- **Functional:** 성공(Success)은 민트, 경고(Warning)는 톤다운된 골드, 오류(Error)는 딥 레드를 사용하여 프리미엄 톤을 유지합니다.

## Typography

강력하고 현대적인 **Montserrat**을 제목에 사용하여 브랜드의 자신감을 드러내고, 가독성이 뛰어난 **Plus Jakarta Sans**를 본문 및 데이터 레이블에 사용하여 정보 전달력을 높였습니다.

한국어 텍스트 적용 시, 영문 Montserrat의 넓은 자폭과 조화를 이룰 수 있도록 한글 폰트의 자간을 미세하게 조정(-0.02em)하여 사용합니다. 수치 데이터(물고기 무게, 길이 등)는 `label-sm`을 사용하여 마치 시계나 계측기처럼 정교하게 표현합니다.

## Layout & Spacing

이 디자인 시스템은 8px 그리드 시스템을 기반으로 한 **유연한 그리드(Fluid Grid)** 모델을 채택합니다. 야외 활동 중 모바일 기기 사용이 잦은 앵글러의 특성을 고려하여 충분한 터치 영역과 여백을 확보합니다.

- **Mobile:** 4컬럼 그리드, 좌우 여백 20px. 모든 요소는 상하 여백을 넉넉히 두어 정보가 섞이지 않게 배치합니다.
- **Desktop/Tablet:** 최대 너비를 1200px로 제한한 고정 그리드를 사용하며, 카드 형태의 레이아웃을 통해 정보를 분할합니다.
- **Spaciousness:** '프리미엄' 감성을 위해 일반적인 앱보다 1.2배 넓은 섹션 간 간격을 유지하여 시각적 숨통을 틔워줍니다.

## Elevation & Depth

프리미엄 다크 테마의 핵심인 **글래스모피즘(Glassmorphism)** 효과를 적극 활용합니다.

1.  **Backdrop Blur:** 모든 오버레이 레이어(모달, 내비게이션 바, 부유형 버튼)는 24px 이상의 백드롭 블러 처리를 적용하여 배경의 색감을 은은하게 투영합니다.
2.  **Stroke Elevation:** 그림자 대신 0.5px~1px 두께의 매우 얇은 반투명 테두리(White 10% ~ 20%)를 사용하여 레이어 간의 경계를 정의합니다.
3.  **Subtle Gradients:** 카드 배경에는 좌측 상단에서 우측 하단으로 흐르는 미세한 선형 그라데이션(Secondary Color → Transparent)을 사용하여 깊이감을 더합니다.

## Shapes

이 디자인 시스템은 **Rounded (0.5rem)** 스타일을 기본으로 합니다. 지나치게 둥근 형태는 캐주얼해 보일 수 있으므로, 정밀한 장비의 느낌을 줄 수 있는 절제된 곡률을 사용합니다.

- **Standard Buttons & Inputs:** 8px (0.5rem) 반경을 사용하여 현대적이고 신뢰감 있는 형태를 유지합니다.
- **Content Cards:** 16px (1rem) 반경을 적용하여 더 큰 영역에 부드러운 인상을 줍니다.
- **Action Chips:** 32px 이상의 완전한 라운드(Pill-shape)를 사용하여 선택 요소임을 강조합니다.

## Components

### Buttons
- **Primary:** Primary Color 배경에 Black 텍스트. `label-md`를 사용하여 강력한 대비를 줍니다.
- **Secondary (Glass):** 화이트 10% 불투명도 배경 + 블러 처리 + 민트색 테두리.
- **Floating Action Button (FAB):** 수면의 파동을 형상화한 은은한 글로우(Glow) 효과를 배경에 적용합니다.

### Cards
- 모든 카드는 `tertiary_color` 배경에 1px의 반투명 테두리를 가집니다.
- 게시물 카드의 경우 상단에 사용자 정보(`body-md`), 하단에 데이터(무게, 길이)를 `primary_color`로 강조하여 표시합니다.

### Input Fields
- 배경은 검정색으로 유지하고, 하단 테두리만 얇게 표시하거나 전체적으로 아주 어두운 회색 면을 사용합니다. 포커스 시 테두리가 민트색으로 빛나는 효과를 추가합니다.

### Navigation (Bottom Bar)
- 아이콘은 아웃라인 스타일을 기본으로 하되, 선택된 상태에서는 민트색 채우기와 함께 아이콘 하단에 작은 점(Dot) 인디케이터를 표시합니다.

### Data Chips
- 날씨, 기온, 조류 정보 등 낚시에 필수적인 데이터는 반투명한 칩 형태로 이미지 위에 플로팅하여 배치합니다. (예: "물때: 7물", "기온: 18°C")