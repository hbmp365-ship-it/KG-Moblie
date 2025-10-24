# KG모빌리언스 결제 시스템

KG모빌리언스 PG사와 연동하여 다양한 결제 수단을 제공하는 통합 결제 솔루션입니다.

## 프로젝트 개요

- **이름**: KG모빌리언스 결제 시스템
- **목표**: 카드결제, 자동결제(빌링), URL결제, 가상계좌, 계좌이체 등 다양한 결제 수단 제공
- **구성**:
  - **Server**: Hono + TypeScript + Cloudflare Pages (결제 API 서버)
  - **Client**: React 19 + Vite (결제 웹 인터페이스)

## 주요 기능

### ✅ 완료된 기능

1. **카드 일반결제** - 신용카드/체크카드 즉시결제
2. **자동결제(빌링)** - 빌링키 발급 및 정기결제
3. **URL 결제** - 결제 링크 생성 및 공유
4. **가상계좌** - 가상계좌 발급 및 입금 확인
5. **계좌이체** - 실시간 계좌이체 결제
6. **결제 조회/취소** - 결제 상태 확인 및 취소 기능

### 📋 API 엔드포인트

#### 1. 카드결제

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/card/pay` | 카드 일반결제 |
| GET | `/api/card/status/:orderId` | 결제 상태 조회 |
| POST | `/api/card/cancel` | 결제 취소 |

**요청 예시 (카드결제)**:
```json
{
  "orderId": "ORD20240101001",
  "amount": 10000,
  "productName": "테스트 상품",
  "buyerName": "홍길동",
  "buyerEmail": "test@example.com",
  "buyerTel": "01012345678",
  "cardNumber": "1234567812345678",
  "cardExpiry": "2512",
  "cardPassword": "12",
  "cardIdNumber": "900101",
  "installment": "00",
  "returnUrl": "https://yoursite.com/payment/result"
}
```

#### 2. 자동결제 (빌링)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/billing/key` | 빌링키 발급 |
| POST | `/api/billing/pay` | 빌링키로 결제 |
| DELETE | `/api/billing/key/:billingKey` | 빌링키 삭제 |

**요청 예시 (빌링키 발급)**:
```json
{
  "orderId": "BILL20240101001",
  "cardNumber": "1234567812345678",
  "cardExpiry": "2512",
  "cardPassword": "12",
  "cardIdNumber": "900101",
  "buyerName": "홍길동",
  "buyerEmail": "test@example.com",
  "buyerTel": "01012345678"
}
```

**요청 예시 (빌링 결제)**:
```json
{
  "billingKey": "BILLING_KEY_12345",
  "orderId": "AUTO20240101001",
  "amount": 10000,
  "productName": "정기결제 상품",
  "buyerName": "홍길동",
  "buyerEmail": "test@example.com"
}
```

#### 3. URL 결제

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/link/create` | 결제 링크 생성 |
| GET | `/api/link/status/:orderId` | 결제 상태 조회 |

**요청 예시**:
```json
{
  "orderId": "LINK20240101001",
  "amount": 10000,
  "productName": "URL 결제 상품",
  "buyerName": "홍길동",
  "buyerEmail": "test@example.com",
  "buyerTel": "01012345678",
  "returnUrl": "https://yoursite.com/payment/result",
  "cancelUrl": "https://yoursite.com/payment/cancel"
}
```

#### 4. 가상계좌

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/vaccount/issue` | 가상계좌 발급 |
| GET | `/api/vaccount/status/:orderId` | 입금 상태 조회 |
| GET | `/api/vaccount/banks` | 지원 은행 목록 |

**요청 예시**:
```json
{
  "orderId": "VA20240101001",
  "amount": 10000,
  "productName": "가상계좌 상품",
  "buyerName": "홍길동",
  "buyerEmail": "test@example.com",
  "buyerTel": "01012345678",
  "bankCode": "004",
  "accountExpiry": "20251231235959",
  "cashReceiptType": "1",
  "cashReceiptId": "01012345678",
  "returnUrl": "https://yoursite.com/payment/result"
}
```

#### 5. 계좌이체

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/account/transfer` | 계좌이체 결제 |
| GET | `/api/account/status/:orderId` | 이체 상태 조회 |
| GET | `/api/account/banks` | 지원 은행 목록 |

**요청 예시**:
```json
{
  "orderId": "AT20240101001",
  "amount": 10000,
  "productName": "계좌이체 상품",
  "buyerName": "홍길동",
  "buyerEmail": "test@example.com",
  "buyerTel": "01012345678",
  "bankCode": "004",
  "accountNumber": "12345678901234",
  "accountPassword": "1234",
  "accountExpiry": "20251231235959",
  "returnUrl": "https://yoursite.com/payment/result"
}
```

## 지원 은행 코드

| 은행명 | 코드 |
|--------|------|
| 국민은행 | 004 |
| 신한은행 | 088 |
| 우리은행 | 020 |
| 하나은행 | 081 |
| NH농협은행 | 011 |
| IBK기업은행 | 003 |
| 케이뱅크 | 089 |
| 카카오뱅크 | 090 |
| 토스뱅크 | 092 |
| SC제일은행 | 023 |
| 씨티은행 | 027 |
| 부산은행 | 032 |
| 경남은행 | 039 |
| 대구은행 | 031 |
| 전북은행 | 037 |
| 광주은행 | 034 |
| 제주은행 | 035 |

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.dev.vars.example` 파일을 `.dev.vars`로 복사하고 실제 값을 입력합니다:

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` 파일 내용:
```
KG_MERCHANT_ID=YOUR_MERCHANT_ID
KG_MERCHANT_KEY=YOUR_MERCHANT_KEY
KG_API_URL=https://testpay.kgmobilians.com
```

### 3. 로컬 개발 서버 실행

```bash
# 빌드
npm run build

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 서버 상태 확인
pm2 list

# 로그 확인
pm2 logs webapp --nostream

# 서버 재시작
npm run clean-port
pm2 restart webapp

# 서버 중지
pm2 delete webapp
```

### 4. 테스트

브라우저에서 `http://localhost:3000` 접속 시 테스트 UI가 표시됩니다.

또는 curl로 테스트:
```bash
curl http://localhost:3000/health
```

## 배포

### Cloudflare Pages 배포

#### 1. Cloudflare API 키 설정
```bash
# 환경변수 설정 도구 실행
setup_cloudflare_api_key
```

#### 2. 프로젝트 생성 (최초 1회)
```bash
npx wrangler pages project create webapp \
  --production-branch main \
  --compatibility-date 2024-01-01
```

#### 3. 환경변수 설정
```bash
npx wrangler pages secret put KG_MERCHANT_ID --project-name webapp
npx wrangler pages secret put KG_MERCHANT_KEY --project-name webapp
npx wrangler pages secret put KG_API_URL --project-name webapp
```

#### 4. 배포
```bash
npm run deploy:prod
```

배포 후 Cloudflare에서 제공하는 URL로 접속 가능합니다:
- `https://webapp.pages.dev`
- `https://main.webapp.pages.dev`

## 프로젝트 구조

```
KG-Moblie/
├── src/                       # 서버 소스코드
│   ├── index.tsx              # 메인 애플리케이션
│   ├── lib/
│   │   └── kgmobilians.ts     # KG모빌리언스 API 클라이언트
│   └── routes/                # API 라우터
│       ├── card.ts            # 카드결제
│       ├── billing.ts         # 자동결제
│       ├── link.ts            # URL결제
│       ├── vaccount.ts        # 가상계좌
│       └── account.ts         # 계좌이체
├── client/                    # React 클라이언트
│   ├── src/
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── Home.jsx
│   │   │   ├── CardPayment.jsx
│   │   │   ├── BillingPayment.jsx
│   │   │   ├── LinkPayment.jsx
│   │   │   ├── VirtualAccount.jsx
│   │   │   └── AccountTransfer.jsx
│   │   ├── services/
│   │   │   └── api.js         # API 서비스 레이어
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md              # 클라이언트 상세 문서
├── .dev.vars.example          # 환경변수 예시
├── ecosystem.config.cjs       # PM2 설정
├── package.json               # 서버 의존성
└── README.md                  # 프로젝트 문서
```

## 클라이언트 애플리케이션

React 기반의 웹 클라이언트가 `client/` 폴더에 포함되어 있습니다.

### 클라이언트 실행 방법

```bash
cd client
npm install
npm run dev
```

자세한 내용은 [client/README.md](client/README.md)를 참고하세요.

## 보안 고려사항

1. **환경변수 관리**: `.dev.vars` 파일은 절대 커밋하지 마세요 (`.gitignore`에 포함됨)
2. **API 키 보안**: 프로덕션에서는 `wrangler secret put`으로 환경변수 설정
3. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용
4. **데이터 암호화**: 민감한 카드 정보는 SHA256으로 암호화하여 전송
5. **입력 검증**: 모든 API 엔드포인트에서 필수 파라미터 검증

## 개발 권장사항

### 다음 단계

1. **데이터베이스 연동** - Cloudflare D1으로 결제 내역 저장
2. **웹훅 처리** - KG모빌리언스 결제 결과 웹훅 수신 엔드포인트 구현
3. **에러 로깅** - Sentry 등 에러 추적 시스템 연동
4. **테스트 코드** - 단위 테스트 및 통합 테스트 작성
5. **관리자 페이지** - 결제 내역 조회 및 관리 UI 구현
6. **결제 통계** - 일/월별 결제 통계 대시보드

## 라이센스

MIT

## 문의

이슈가 있거나 문의사항이 있으시면 GitHub Issues를 이용해주세요.

---

**Last Updated**: 2024-10-24
**Status**: ✅ Active
**Tech Stack**: 
- **Backend**: Hono + TypeScript + Cloudflare Pages
- **Frontend**: React 19 + Vite + React Router
- **PG**: KG모빌리언스
