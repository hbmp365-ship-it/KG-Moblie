export interface Env {
  // REST API 방식 (권장)
  KG_SID: string;          // KG모빌리언스 서비스 ID (가맹점 코드)
  KG_MERCHANT_KEY: string; // KG모빌리언스 상점 키
  KG_API_URL: string;      // KG모빌리언스 API URL
  KG_SITE_URL: string;     // 가맹점 사이트 URL
  
  // 레거시 환경변수 (하위 호환)
  KG_MERCHANT_ID?: string;
  KG_SERVICE_ID?: string;
  KG_CREDIT_CARD_SERVICE_ID?: string;
  KG_MOBILE_SERVICE_ID?: string;
  KG_EASY_PAY_SERVICE_ID?: string;
  KG_ACCOUNT_TRANSFER_SERVICE_ID?: string;
  KG_VIRTUAL_ACCOUNT_SERVICE_ID?: string;
}
