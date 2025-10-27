# KG모빌리언스 REST API 연동 가이드

## 📖 공식 문서
- [KG모빌리언스 REST API 가이드](https://www.mobilians.co.kr/doc/guide/restapi-info)

## 🔧 환경 설정

### 1. 환경변수 설정

`.env.example` 파일을 `.env`로 복사하고 실제 값으로 수정하세요:

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 내용:
```env
# API URL
# 테스트: https://test.mobilians.co.kr
# 운영: https://pay.mobilians.co.kr
KG_API_URL=https://test.mobilians.co.kr

# 서비스 ID (가맹점 코드)
KG_SID=YOUR_SERVICE_ID

# 상점 키 (Merchant Key)
KG_MERCHANT_KEY=YOUR_MERCHANT_KEY

# 가맹점 사이트 URL
KG_SITE_URL=http://localhost:3001
```

### 2. ngrok 사용 (로컬 테스트 시)

KG모빌리언스는 외부에서 접근 가능한 URL이 필요합니다. ngrok을 사용하여 로컬 서버를 외부에 노출하세요:

```bash
# ngrok 설치 후 실행
ngrok http 3001

# 생성된 URL을 KG_SITE_URL에 설정
# 예: https://abc123.ngrok-free.app
```

## 🚀 REST API 결제 흐름

### 1단계: 거래 등록 (Registration)
서버에서 KG모빌리언스에 거래 정보를 등록합니다.

**요청:**
```
POST /MUP/api/registration
```

**요청 파라미터:**
- `sid`: 서비스 ID
- `trade_id`: 가맹점 거래번호
- `product_name`: 상품명
- `amount.total`: 결제금액
- `site_url`: 가맹점 사이트 URL
- `ok_url`: 결제 완료 후 리다이렉트 URL
- `close_url`: 결제 취소 시 리다이렉트 URL
- `call_type`: 결제창 호출 방식 (P: popup, S: self, I: iframe)
- `hybrid_pay`: 인증+승인 여부 (Y: 인증만, N: 인증+승인)
- `user_name`: 구매자명
- `user_email`: 구매자 이메일

**응답:**
```json
{
  "result_code": "0000",
  "result_msg": "성공",
  "tid": "거래 등록 고유번호"
}
```

### 2단계: 결제창 호출
클라이언트에서 브라우저를 통해 결제창을 엽니다.

**결제창 URL:**
```
GET /MUP/api/payment.mcash?tid={tid}
```

클라이언트에서 새창으로 열기:
```javascript
window.open(
  paymentUrl,
  'payment',
  'width=800,height=600,scrollbars=yes,resizable=yes'
);
```

### 3단계: 결제 승인 (Approval)
사용자가 카드 정보를 입력하고 결제를 완료하면, KG모빌리언스가 `ok_url`로 리다이렉트합니다.

**리다이렉트 파라미터:**
- `tid`: 거래 등록 고유번호
- `pay_token`: 결제 토큰
- `cash_code`: 결제 수단
- `amount`: 결제 금액

서버에서 최종 승인 요청:
```
POST /MUP/api/approval
```

**요청 파라미터:**
- `sid`: 서비스 ID
- `tid`: 거래 등록 고유번호
- `cash_code`: 결제 수단
- `amount`: 결제 금액
- `pay_token`: 결제 토큰

### 4단계: 결제 취소 (Cancellation)
결제를 취소할 때 사용합니다.

**요청:**
```
POST /MUP/api/cancellation
```

**요청 파라미터:**
- `sid`: 서비스 ID
- `trade_id`: 가맹점 거래번호
- `cash_code`: 결제 수단
- `pay_token`: 결제 토큰
- `cancel_type`: 'C' (고정)
- `part_cancel`: 'N' (전체), 'Y' (부분)
- `amount`: 취소 금액
- `hmac`: 무결성 검증 값 (HMAC SHA256)

**HMAC 생성:**
```javascript
const data = `${sid}${trade_id}${amount}`;
const hmac = CryptoJS.HmacSHA256(data, merchantKey).toString(CryptoJS.enc.Base64);
```

## 📝 구현된 API 엔드포인트

### 1. 카드 결제창 요청
```
POST /api/card/pay

Request Body:
{
  "orderId": "ORD1234567890",
  "amount": 10000,
  "productName": "테스트 상품",
  "buyerName": "홍길동",
  "buyerEmail": "test@example.com",
  "buyerTel": "01012345678",
  "returnUrl": "https://yoursite.com/payment/result",
  "cancelUrl": "https://yoursite.com/payment/cancel"
}

Response:
{
  "success": true,
  "tid": "KG거래번호",
  "paymentUrl": "https://test.mobilians.co.kr/MUP/api/payment.mcash?tid=..."
}
```

### 2. 결제 상태 조회
```
GET /api/card/status/:orderId

Response:
{
  "success": true,
  "data": { ... }
}
```

### 3. 결제 취소
```
POST /api/card/cancel

Request Body:
{
  "tradeId": "ORD1234567890",
  "cashCode": "CN",
  "amount": 10000,
  "payToken": "결제토큰",
  "partCancel": "N"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### 4. 웹훅 수신
```
POST /api/card/webhook

Request Body:
{
  "orderId": "ORD1234567890",
  "status": "success",
  "amount": 10000,
  "transactionId": "거래ID"
}
```

## 🧪 테스트

### 로컬 환경
1. 서버 실행: `npm run dev` (포트: 5714)
2. 클라이언트 실행: `cd client && npm run dev` (포트: 3001)
3. 브라우저에서 접속: `http://localhost:3001/card`

### ngrok 환경
1. ngrok 실행: `ngrok http 3001`
2. 생성된 URL로 접속: `https://your-ngrok-url.ngrok-free.app/card`
3. 클라이언트 `.env` 수정:
   ```env
   VITE_API_URL=https://your-ngrok-url.ngrok-free.app
   ```

## 🔍 결제 수단 코드

| 코드 | 결제 수단 |
|------|-----------|
| CN   | 신용카드  |
| VA   | 가상계좌  |
| AC   | 계좌이체  |
| HP   | 휴대폰    |
| GM   | 상품권    |

## 📞 지원

- KG모빌리언스 고객센터: 1644-0485
- 이메일: help@mobilians.co.kr
- 관리자 페이지: https://www.mobilians.co.kr

