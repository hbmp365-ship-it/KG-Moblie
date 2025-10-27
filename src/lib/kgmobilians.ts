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
  tradeId: string;         // 가맹점 거래번호
  amount: number;          // 결제금액
  productName: string;     // 상품명
  userName: string;        // 구매자명
  userEmail?: string;      // 구매자 이메일
  okUrl: string;           // 결제(인증) 결과 처리 URL
  closeUrl?: string;       // 취소 버튼 클릭 redirect URL
  failUrl?: string;        // 결제 실패 redirect URL
  notiUrl?: string;        // 결제 결과 노티 URL (가상계좌 필수)
  cashCode?: string;       // 결제 수단 (CN:카드, VA:가상계좌 등)
  callType?: 'P' | 'S' | 'I'; // P:popup(기본), S:self, I:iframe
  hybridPay?: 'Y' | 'N';   // Y:인증만, N:인증+승인(기본)
  mstr?: string;           // 가맹점 콜백 변수
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
        sid: this.config.sid,
        trade_id: request.tradeId,
        product_name: request.productName,
        amount: {
          total: request.amount.toString(),
        },
        site_url: this.config.siteUrl,
        ok_url: request.okUrl,
        call_type: request.callType || 'P',
        hybrid_pay: request.hybridPay || 'N',
      };

      // 선택적 필드 추가
      if (request.cashCode) payload.cash_code = request.cashCode;
      if (request.closeUrl) payload.close_url = request.closeUrl;
      if (request.failUrl) payload.fail_url = request.failUrl;
      if (request.notiUrl) payload.noti_url = request.notiUrl;
      if (request.userName) payload.user_name = request.userName;
      if (request.userEmail) payload.user_email = request.userEmail;
      if (request.mstr) payload.mstr = request.mstr;

      const response = await fetch(`${this.config.apiUrl}/MUP/api/registration`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.result_code !== '0000') {
        return {
          success: false,
          error: data.result_msg || '거래 등록 실패',
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
