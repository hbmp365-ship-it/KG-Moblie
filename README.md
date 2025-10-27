# KG모빌리언스 통합 결제 시스템

KG모빌리언스 REST API를 사용하여 하나의 결제창에서 모든 결제 수단을 제공하는 통합 결제 솔루션입니다.

## 프로젝트 개요

- **이름**: KG모빌리언스 통합 결제 시스템
- **목표**: 통합 결제창으로 카드, 가상계좌, 계좌이체 등 모든 결제 수단을 간편하게 제공
- **구성**:
  - **Server**: Hono + TypeScript + Cloudflare Pages (결제 API 서버)
  - **API 버전**: KG모빌리언스 REST API v1
  - **공식 문서**: https://www.mobilians.co.kr/doc/guide/restapi-info

## 주요 기능

### ✅ 완료된 기능

1. **통합 결제창** - 하나의 결제창에서 모든 결제 수단 선택 가능
2. **결제 수단**:
   - 신용카드/체크카드
   - 가상계좌
   - 계좌이체
   - 휴대폰 결제
   - 상품권 결제
3. **결제 승인** - 인증 완료 후 최종 승인 처리
4. **결제 취소** - 전체/부분 취소 지원
5. **웹훅 처리** - 결제 결과 실시간 수신

### 📋 API 엔드포인트

#### 1. 통합 결제 (권장)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/payment/request` | 거래 등록 및 결제창 생성 |
| POST | `/api/payment/approval` | 결제 승인 (hybrid_pay='Y'인 경우) |
| POST | `/api/payment/cancel` | 결제 취소 |
| POST | `/api/payment/webhook` | 결제 결과 웹훅 수신 |

**요청 예시 (통합 결제창)**:
```json
{
  "tradeId": "TRD20240101001",
  "amount": 10000,
  "productName": "테스트 상품",
  "userName": "홍길동",
  "userEmail": "test@example.com",
  "okUrl": "https://yoursite.com/api/payment/result",
  "closeUrl": "https://yoursite.com/payment/cancel",
  "failUrl": "https://yoursite.com/payment/fail",
  "callType": "P",
  "hybridPay": "N"
}
```

**응답 예시**:
```json
{
  "success": true,
  "tid": "202c8c1a66b2fed80",
  "paymentUrl": "https://test.mobilians.co.kr/MUP/api/payment.mcash?tid=202c8c1a66b2fed80",
  "message": "결제창이 생성되었습니다. paymentUrl로 결제를 진행하세요."
}
```

**결제 흐름**:
1. `/api/payment/request`로 거래 등록 → `tid`와 `paymentUrl` 수신
2. `paymentUrl`을 팝업/새창으로 열기 → 사용자가 결제 수단 선택 및 결제
3. 결제 완료 후 `okUrl`로 결과 전달 (hybrid_pay='N'인 경우 자동 승인)
4. hybrid_pay='Y'인 경우 `/api/payment/approval`로 수동 승인

**특정 결제 수단만 사용하기**:
```json
{
  "tradeId": "TRD20240101001",
  "amount": 10000,
  "productName": "테스트 상품",
  "userName": "홍길동",
  "okUrl": "https://yoursite.com/api/payment/result",
  "cashCode": "CN",
  "callType": "P"
}
```

**결제 수단 코드 (cashCode)**:
- `CN`: 신용카드
- `VA`: 가상계좌
- `AC`: 계좌이체
- `HP`: 휴대폰 결제
- `GM`: 상품권
- 미지정 시: 모든 결제 수단 표시

#### 2. 결제 취소

**요청 예시**:
```json
{
  "tradeId": "TRD20240101001",
  "cashCode": "CN",
  "amount": 10000,
  "payToken": "150416214170000",
  "cancelType": "C",
  "partCancel": "N"
}
```

**부분 취소 예시**:
```json
{
  "tradeId": "TRD20240101001",
  "cashCode": "CN",
  "amount": 5000,
  "payToken": "150416214170000",
  "cancelType": "C",
  "partCancel": "Y",
  "billType": "00",
  "tax": 500,
  "taxFree": 0
}
```

#### 3. 레거시 API (하위 호환)

기존 방식의 개별 API도 계속 지원됩니다:
- `/api/card/*` - 카드결제
- `/api/billing/*` - 자동결제(빌링)
- `/api/link/*` - URL 결제
- `/api/vaccount/*` - 가상계좌
- `/api/account/*` - 계좌이체

**참고**: 새로운 프로젝트는 `/api/payment/*` 통합 API 사용을 권장합니다.

## 결제 수단 및 은행 코드

### 결제 수단 코드 (cashCode)

| 코드 | 결제 수단 |
|------|-----------|
| CN | 신용카드 |
| VA | 가상계좌 |
| AC | 계좌이체 |
| HP | 휴대폰 결제 |
| GM | 상품권 |

### 은행 코드 (bankCode)

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
KG_SID=YOUR_SERVICE_ID
KG_MERCHANT_KEY=YOUR_MERCHANT_KEY
KG_API_URL=https://test.mobilians.co.kr
KG_SITE_URL=http://localhost:3000
```

**환경변수 설명**:
- `KG_SID`: KG모빌리언스에서 발급받은 서비스 ID (12자리)
- `KG_MERCHANT_KEY`: 상점 키 (HMAC 검증용)
- `KG_API_URL`: API 엔드포인트
  - 테스트계: `https://test.mobilians.co.kr`
  - 운영계: `https://mup.mobilians.co.kr`
- `KG_SITE_URL`: 가맹점 사이트 URL (거래 등록에 사용)

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
npx wrangler pages secret put KG_SID --project-name webapp
npx wrangler pages secret put KG_MERCHANT_KEY --project-name webapp
npx wrangler pages secret put KG_API_URL --project-name webapp
npx wrangler pages secret put KG_SITE_URL --project-name webapp
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
webapp/
├── src/                       # 서버 소스코드
│   ├── index.tsx              # 메인 애플리케이션
│   ├── lib/
│   │   └── kgmobilians.ts     # KG모빌리언스 REST API 클라이언트
│   ├── routes/                # API 라우터
│   │   ├── payment.ts         # 통합 결제 API (권장)
│   │   ├── card.ts            # 카드결제 (레거시)
│   │   ├── billing.ts         # 자동결제 (레거시)
│   │   ├── link.ts            # URL결제 (레거시)
│   │   ├── vaccount.ts        # 가상계좌 (레거시)
│   │   └── account.ts         # 계좌이체 (레거시)
│   └── types/
│       └── env.ts             # 환경변수 타입 정의
├── client/                    # React 클라이언트 (별도 앱)
├── .dev.vars.example          # 환경변수 예시
├── .gitignore                 # Git 제외 파일
├── ecosystem.config.cjs       # PM2 설정
├── package.json               # 의존성 관리
├── tsconfig.json              # TypeScript 설정
├── vite.config.ts             # Vite 설정
├── wrangler.jsonc             # Cloudflare 설정
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

## API 연동 가이드

### 1. 통합 결제창 사용 (권장)

**장점**:
- 하나의 API로 모든 결제 수단 지원
- 사용자가 결제창에서 원하는 결제 수단 선택
- 간단한 구현

**순서**:
1. **거래 등록**: `POST /api/payment/request` → `tid`, `paymentUrl` 수신
2. **결제창 열기**: `paymentUrl`을 팝업/새창/iframe으로 표시
3. **결제 완료**: 사용자가 결제 수단 선택 및 결제 완료
4. **결과 수신**: `okUrl`로 결제 결과 전달받음

### 2. 특정 결제 수단만 사용

`cashCode` 파라미터로 특정 결제 수단만 표시:
- `cashCode: "CN"` - 카드결제만
- `cashCode: "VA"` - 가상계좌만
- `cashCode: "AC"` - 계좌이체만

### 3. 인증과 승인 분리 (고급)

`hybridPay: "Y"`로 설정하면:
1. 결제창에서 인증만 처리
2. `okUrl`에서 `tid`, `payToken` 수신
3. `/api/payment/approval`로 수동 승인
4. 재고 확인 등 추가 로직 구현 가능

## 개발 권장사항

### 다음 단계

1. **데이터베이스 연동** - Cloudflare D1으로 결제 내역 저장
2. **웹훅 처리 강화** - 가상계좌 입금 완료 등 비동기 결과 처리
3. **에러 로깅** - Sentry 등 에러 추적 시스템 연동
4. **테스트 코드** - 단위 테스트 및 통합 테스트 작성
5. **관리자 페이지** - 결제 내역 조회 및 관리 UI 구현
6. **결제 통계** - 일/월별 결제 통계 대시보드
7. **보안 강화** - HMAC 검증, IP 화이트리스트 등

## 라이센스

MIT

## 문의

이슈가 있거나 문의사항이 있으시면 GitHub Issues를 이용해주세요.

## 변경 이력

### v2.0.0 (2025-01-27)
- **통합 결제 API 추가**: `/api/payment/*` 엔드포인트 신규 구현
- **KG모빌리언스 REST API 연동**: 공식 API 가이드에 따라 전면 개편
- **결제창 방식 변경**: 거래 등록 → 결제창 호출 → 승인 프로세스
- **HMAC 검증 추가**: 결제 취소 시 무결성 검증 강화
- **환경변수 변경**: `KG_SID`, `KG_SITE_URL` 추가
- **레거시 API 유지**: 기존 API도 하위 호환 지원

### v1.0.0 (2024-10-24)
- 초기 버전 출시
- 카드, 빌링, URL결제, 가상계좌, 계좌이체 개별 API

---

**Last Updated**: 2025-01-27
**Status**: ✅ Active
**Tech Stack**: 
- **Backend**: Hono + TypeScript + Cloudflare Pages
- **PG**: KG모빌리언스 REST API v1
- **API 문서**: https://www.mobilians.co.kr/doc/guide/restapi-info
