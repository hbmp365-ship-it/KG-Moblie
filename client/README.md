# KG모빌리언스 결제 클라이언트

React로 구현한 KG모빌리언스 결제 시스템 클라이언트 웹 애플리케이션입니다.

## 프로젝트 개요

- **이름**: KG모빌리언스 결제 클라이언트
- **목표**: KG모빌리언스 결제 API 서버를 호출하는 사용자 친화적인 웹 인터페이스 제공
- **기술스택**: React + Vite + React Router + Axios

## 주요 기능

### ✅ 완료된 기능

1. **홈 대시보드** - 전체 결제 수단 소개 및 서버 상태 확인
2. **카드결제** - 신용카드/체크카드 즉시결제
3. **자동결제(빌링)** - 빌링키 발급, 결제, 삭제
4. **URL 결제** - 결제 링크 생성 및 공유
5. **가상계좌** - 가상계좌 발급 및 입금 상태 조회
6. **계좌이체** - 실시간 계좌이체 결제

## 페이지 구성

### 1. 홈 (`/`)
- 5가지 결제 수단 소개 카드
- 서버 연결 상태 표시
- 주요 특징 안내

### 2. 카드결제 (`/card`)
- 카드 정보 입력 폼
- 결제 실행 및 상태 조회
- 실시간 결과 표시

### 3. 자동결제 (`/billing`)
- 3가지 탭: 빌링키 발급 / 빌링 결제 / 빌링키 삭제
- 빌링키 저장 및 재사용
- 정기결제 관리

### 4. URL 결제 (`/link`)
- 결제 링크 생성
- 생성된 링크 표시 및 복사
- 결제 상태 조회

### 5. 가상계좌 (`/vaccount`)
- 은행 선택 (17개 은행 지원)
- 가상계좌 발급
- 입금 상태 실시간 조회
- 현금영수증 발행 옵션

### 6. 계좌이체 (`/account`)
- 계좌 정보 입력
- 실시간 이체 처리
- 이체 상태 확인

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example` 파일을 `.env`로 복사하고 API 서버 URL을 설정합니다:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```
VITE_API_URL=https://your-api-server-url.com
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3001` 접속

### 4. 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 5. 프리뷰

```bash
npm run preview
```

## 프로젝트 구조

```
kg-payment-client/
├── src/
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── Home.jsx           # 홈 대시보드
│   │   ├── CardPayment.jsx    # 카드결제
│   │   ├── BillingPayment.jsx # 자동결제
│   │   ├── LinkPayment.jsx    # URL 결제
│   │   ├── VirtualAccount.jsx # 가상계좌
│   │   └── AccountTransfer.jsx # 계좌이체
│   ├── services/
│   │   └── api.js             # API 서비스 (Axios)
│   ├── App.jsx                # 메인 앱 컴포넌트
│   ├── App.css                # 전역 스타일
│   └── main.jsx               # 엔트리 포인트
├── .env                       # 환경변수
├── .env.example               # 환경변수 예시
├── package.json               # 의존성 및 스크립트
└── README.md                  # 프로젝트 문서
```

## API 서비스 구조

`src/services/api.js`에서 다음 API를 제공합니다:

```javascript
// 카드결제 API
cardPaymentAPI.pay(data)
cardPaymentAPI.getStatus(orderId)
cardPaymentAPI.cancel(data)

// 자동결제 API
billingAPI.requestKey(data)
billingAPI.pay(data)
billingAPI.deleteKey(billingKey)

// URL 결제 API
linkPaymentAPI.create(data)
linkPaymentAPI.getStatus(orderId)

// 가상계좌 API
vAccountAPI.issue(data)
vAccountAPI.getStatus(orderId)
vAccountAPI.getBanks()

// 계좌이체 API
accountTransferAPI.transfer(data)
accountTransferAPI.getStatus(orderId)
accountTransferAPI.getBanks()
```

## 주요 특징

- ✅ **반응형 디자인** - 모바일, 태블릿, 데스크톱 지원
- ✅ **직관적인 UI** - 사용자 친화적인 인터페이스
- ✅ **실시간 상태 표시** - 로딩, 성공, 실패 상태 표시
- ✅ **결과 JSON 뷰어** - 상세한 응답 데이터 표시
- ✅ **에러 핸들링** - 명확한 에러 메시지
- ✅ **주문번호 자동 생성** - 클릭 한 번으로 새 주문번호 생성
- ✅ **은행 목록 자동 로드** - 지원 은행 목록 API 연동

## 스타일링

- **그라디언트 헤더** - 시각적으로 매력적인 디자인
- **카드 레이아웃** - 정보를 명확하게 구분
- **색상 코딩** - 성공(초록), 에러(빨강), 정보(파랑)
- **호버 효과** - 인터랙티브한 사용자 경험
- **애니메이션** - 부드러운 전환 효과

## 사용 방법

### 카드결제 예시

1. 카드결제 메뉴 클릭
2. 결제 정보 및 카드 정보 입력
3. "결제하기" 버튼 클릭
4. 결과 확인

### 자동결제 예시

1. 자동결제 메뉴 클릭
2. "빌링키 발급" 탭 선택
3. 카드 정보 입력 후 발급
4. 발급된 빌링키로 "빌링 결제" 탭에서 결제

### URL 결제 예시

1. URL 결제 메뉴 클릭
2. 결제 정보 입력
3. "결제 링크 생성" 클릭
4. 생성된 링크를 고객에게 전송

## 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Netlify 배포

```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
netlify deploy --prod
```

### 정적 파일 호스팅

빌드 후 `dist/` 디렉토리를 원하는 호스팅 서비스에 업로드하면 됩니다.

## 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| VITE_API_URL | KG모빌리언스 결제 API 서버 URL | https://api.example.com |

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 개발 가이드

### 새로운 결제 방식 추가

1. `src/pages/` 에 새 페이지 컴포넌트 생성
2. `src/services/api.js` 에 API 함수 추가
3. `src/App.jsx` 에 라우트 추가
4. 네비게이션 메뉴에 링크 추가

### API 서버 변경

`.env` 파일의 `VITE_API_URL` 값을 변경하면 됩니다.

## 문제 해결

### API 연결 오류
- `.env` 파일의 `VITE_API_URL`이 올바른지 확인
- API 서버가 실행 중인지 확인
- CORS 설정이 올바른지 확인

### 빌드 오류
- `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`
- 캐시 삭제: `npm run build -- --force`

## 라이센스

MIT

## 문의

이슈가 있거나 문의사항이 있으시면 GitHub Issues를 이용해주세요.

---

**Last Updated**: 2024-10-24
**Status**: ✅ Active
**Tech Stack**: React 19 + Vite 7 + React Router 7 + Axios
