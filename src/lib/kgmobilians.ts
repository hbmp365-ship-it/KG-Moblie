import CryptoJS from 'crypto-js';

/**
 * KG모빌리언스 REST API 연동 라이브러리
 * API 문서: https://www.mobilians.co.kr/doc/guide/restapi-info
 */

export interface KGConfig {
  sid: string;             // 서비스 ID (가맹점 코드)
  merchantKey: string;     // 상점 키 (HMAC 검증에 사용)
  apiUrl: string;          // API URL (운영계/테스트계)
  siteUrl: string;         // 가맹점 사이트 URL
}

// 거래 등록 요청
export interface RegistrationRequest {
  // 필수 필드 (Y)
  tradeId: string;         // 가맹점 거래번호 (40자)
  productName: string;     // 상품명 (50자)
  amount: number;          // 총 결제 금액 (10자)
  siteUrl: string;         // 가맹점 사이트 URL (20자)
  okUrl: string;           // 결제(인증) 결과 처리 URL (128자)
  
  // 선택적 필드 (N)
  cashCode?: string;       // 결제 수단 (2자): CN(카드), VA(가상계좌), AC(계좌이체), HP(휴대폰), GM(상품권)
  callType?: 'P' | 'S' | 'I'; // 결제창 호출 방식 (4자): P(popup), S(self), I(iframe)
  hybridPay?: 'Y' | 'N';   // 하이브리드 결제 (1자): Y(인증만), N(인증+승인)
  notiUrl?: string;        // 결제 결과 노티 URL (128자) - 가상계좌 필수
  notiEmail?: string;      // 담당자 이메일 (30자)
  closeUrl?: string;       // 취소 버튼 클릭 redirect URL (128자)
  failUrl?: string;        // 결제 실패 redirect URL (128자)
  userId?: string;         // 사용자 ID (50자)
  userName?: string;       // 사용자 이름 (50자)
  userEmail?: string;      // 사용자 이메일 (30자)
  businessNo?: string;     // 사업자번호 (13자)
  sellerTel?: string;      // 판매자 전화번호 (15자)
  sellerName?: string;     // 판매자명 (50자)
  onlyOnce?: 'Y' | 'N';    // 반복결제 설정 (1자): Y(단건), N(다건)
  timeStamp?: string;      // 유효시간 (14자): yyyymmddhhmmss
  mstr?: string;           // 가맹점 콜백 변수 (2000자)
  cpLogo?: 'Y' | 'N';     // 가맹점 로고 표기 (1자): Y/N
  cssType?: string;        // 결제창 색상 (7자): HTML 색상코드
  cpUi?: string;          // 가맹점별 UI 설정 (20자)
  appScheme?: string;     // APP URL Scheme (50자)
}

// 결제 승인 요청
export interface ApprovalRequest {
  tid: string;             // 거래 등록 고유번호
  cashCode: string;        // 결제 수단
  amount: number;          // 결제 금액
  payToken: string;        // 결제 토큰
}

// 결제 취소 요청
export interface CancellationRequest {
  tradeId: string;         // 가맹점 거래번호
  cashCode: string;        // 결제 수단
  amount: number;          // 취소 금액
  payToken: string;        // 결제 토큰
  cancelType: 'C';         // 취소 구분 (C:고정)
  partCancel: 'Y' | 'N';   // 부분취소 여부 (N:전체, Y:부분)
  billType?: string;       // 과세 구분 (00:과세, 10:비과세, 20:복합과세)
  tax?: number;            // 부가세
  taxFree?: number;        // 면세 금액
  taxAmount?: number;      // 과세 금액
}

// 거래 등록 응답
export interface RegistrationResponse {
  success: boolean;
  tid?: string;            // 거래 등록 고유번호
  paymentUrl?: string;     // 결제창 URL
  error?: string;
}

export class KGMobilians {
  private config: KGConfig;

  constructor(config: KGConfig) {
    this.config = config;
  }

  /**
   * HMAC SHA256 생성 (무결성 검증용)
   * 취소 API에서 사용
   */
  private generateHMAC(data: string): string {
    return CryptoJS.HmacSHA256(data, this.config.merchantKey).toString(CryptoJS.enc.Base64);
  }

  /**
   * 취소 요청용 HMAC 생성
   */
  private generateCancelHMAC(tradeId: string, amount: number): string {
    const data = `${this.config.sid}${tradeId}${amount}`;
    return this.generateHMAC(data);
  }

  /**
   * API 요청 공통 헤더 생성
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * 1단계: 거래 등록
   * POST /MUP/api/registration
   * 결제창 호출을 위한 거래정보를 등록합니다.
   */
  async registration(request: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      const payload: any = {
        // 필수 필드 (Y)
        sid: this.config.sid,                    // 서비스 ID (12자)
        trade_id: request.tradeId,               // 가맹점 거래번호 (40자)
        product_name: request.productName,       // 상품명 (50자)
        amount: {
          total: request.amount.toString(),      // 총 결제 금액 (10자)
        },
        site_url: request.siteUrl,              // 가맹점 사이트 URL (20자)
        ok_url: request.okUrl,                  // 결제 완료 URL (128자)
      };

      // 선택적 필드 (N) - 값이 있을 때만 추가
      if (request.cashCode) payload.cash_code = request.cashCode;           // 결제 수단 (2자)
      if (request.callType) payload.call_type = request.callType;          // 결제창 호출 방식 (4자)
      if (request.hybridPay) payload.hybrid_pay = request.hybridPay;        // 하이브리드 결제 (1자)
      if (request.notiUrl) payload.noti_url = request.notiUrl;             // 노티 URL (128자)
      if (request.notiEmail) payload.noti_email = request.notiEmail;       // 담당자 이메일 (30자)
      if (request.closeUrl) payload.close_url = request.closeUrl;          // 취소 URL (128자)
      if (request.failUrl) payload.fail_url = request.failUrl;             // 실패 URL (128자)
      if (request.userId) payload.user_id = request.userId;                // 사용자 ID (50자)
      if (request.userName) payload.user_name = request.userName;          // 사용자 이름 (50자)
      if (request.userEmail) payload.user_email = request.userEmail;       // 사용자 이메일 (30자)
      if (request.businessNo) payload.business_no = request.businessNo;    // 사업자번호 (13자)
      if (request.sellerTel) payload.seller_tel = request.sellerTel;       // 판매자 전화번호 (15자)
      if (request.sellerName) payload.seller_name = request.sellerName;     // 판매자명 (50자)
      if (request.onlyOnce) payload.only_once = request.onlyOnce;           // 반복결제 설정 (1자)
      if (request.timeStamp) payload.time_stamp = request.timeStamp;        // 유효시간 (14자)
      if (request.mstr) payload.mstr = request.mstr;                        // 가맹점 콜백 변수 (2000자)
      if (request.cpLogo) payload.cp_logo = request.cpLogo;                 // 가맹점 로고 (1자)
      if (request.cssType) payload.css_type = request.cssType;              // 결제창 색상 (7자)
      if (request.cpUi) payload.cp_ui = request.cpUi;                       // 가맹점별 UI (20자)
      if (request.appScheme) payload.app_scheme = request.appScheme;       // APP URL Scheme (50자)

      console.log('KG모빌리언스 거래 등록 요청:', {
        url: `${this.config.apiUrl}/MUP/api/registration`,
        payload: payload
      });

      const response = await fetch(`${this.config.apiUrl}/MUP/api/registration`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      console.log('KG모빌리언스 거래 등록 응답:', {
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (!response.ok || data.result_code !== '0000') {
        return {
          success: false,
          error: `${data.result_msg || '거래 등록 실패'} (code: ${data.result_code})`,
        };
      }

      // 결제창 URL 생성
      const paymentUrl = `${this.config.apiUrl}/MUP/api/payment.mcash?tid=${data.tid}`;
      
      return {
        success: true,
        tid: data.tid,
        paymentUrl: paymentUrl,
      };
    } catch (error: any) {
      console.error('KG모빌리언스 거래 등록 오류:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 2단계: 결제창 호출
   * 브라우저에서 직접 호출 (Form submit 또는 window.open)
   * URL: /MUP/api/payment.mcash?tid={tid}
   */
  getPaymentWindowUrl(tid: string): string {
    return `${this.config.apiUrl}/MUP/api/payment.mcash?tid=${tid}`;
  }

  /**
   * 3단계: 결제 승인
   * POST /MUP/api/approval
   * 사용자 인증 완료 후 최종 승인을 수행합니다.
   */
  async approval(request: ApprovalRequest): Promise<any> {
    try {
      const payload = {
        sid: this.config.sid,
        tid: request.tid,
        cash_code: request.cashCode,
        amount: request.amount.toString(),
        pay_token: request.payToken,
      };

      const response = await fetch(`${this.config.apiUrl}/MUP/api/approval`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.result_msg || '결제 승인 실패',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }



  /**
   * 결제 취소
   * POST /MUP/api/cancellation
   */
  async cancellation(request: CancellationRequest): Promise<any> {
    try {
      // HMAC 생성
      const hmac = this.generateCancelHMAC(request.tradeId, request.amount);

      const payload: any = {
        sid: this.config.sid,
        trade_id: request.tradeId,
        cash_code: request.cashCode,
        pay_token: request.payToken,
        cancel_type: request.cancelType,
        part_cancel: request.partCancel,
        amount: request.amount.toString(),
        hmac: hmac,
      };

      // 선택적 필드
      if (request.billType) payload.bill_type = request.billType;
      if (request.tax) payload.tax = request.tax.toString();
      if (request.taxFree) payload.tax_free = request.taxFree.toString();
      if (request.taxAmount) payload.tax_amount = request.taxAmount.toString();

      const response = await fetch(`${this.config.apiUrl}/MUP/api/cancellation`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.result_msg || '결제 취소 실패',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

}

/**
 * 결제 수단 코드
 */
export const CASH_CODES = {
  CN: 'CN',           // 신용카드
  VA: 'VA',           // 가상계좌
  AC: 'AC',           // 계좌이체
  HP: 'HP',           // 휴대폰
  GM: 'GM',           // 상품권
} as const;

/**
 * 은행 코드
 */
export const BANK_CODES = {
  KB: '004',           // 국민은행
  SHINHAN: '088',      // 신한은행
  WOORI: '020',        // 우리은행
  HANA: '081',         // 하나은행
  NH: '011',           // NH농협은행
  IBK: '003',          // IBK기업은행
  KBANK: '089',        // 케이뱅크
  KAKAO: '090',        // 카카오뱅크
  TOSS: '092',         // 토스뱅크
  SC: '023',           // SC제일은행
  CITI: '027',         // 한국씨티은행
  BUSAN: '032',        // 부산은행
  KYONGNAM: '039',     // 경남은행
  DAEGU: '031',        // 대구은행
  JEONBUK: '037',      // 전북은행
  GWANGJU: '034',      // 광주은행
  JEJU: '035',         // 제주은행
} as const;
