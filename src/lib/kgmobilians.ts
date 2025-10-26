import CryptoJS from 'crypto-js';

/**
 * KG모빌리언스 결제 API 연동 라이브러리
 */

export interface KGConfig {
  merchantId: string;      // 상점 ID
  merchantKey: string;     // 상점 키 (암호화에 사용)
  apiUrl: string;          // API URL (운영계/테스트계)
}

export interface PaymentRequest {
  orderId: string;         // 주문번호
  amount: number;          // 결제금액
  productName: string;     // 상품명
  buyerName: string;       // 구매자명
  buyerEmail: string;      // 구매자 이메일
  buyerTel: string;        // 구매자 전화번호
  returnUrl?: string;      // 결제 결과 수신 URL
  cancelUrl?: string;      // 취소 URL
}

export interface CardPaymentRequest extends PaymentRequest {
  cardNumber: string;      // 카드번호
  cardExpiry: string;      // 유효기간 (YYMM)
  cardPassword: string;    // 카드 비밀번호 앞 2자리
  cardIdNumber: string;    // 생년월일 6자리 또는 사업자번호
  installment: string;     // 할부개월 (00:일시불)
}

export interface BillingKeyRequest {
  orderId: string;
  cardNumber: string;
  cardExpiry: string;
  cardPassword: string;
  cardIdNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerTel: string;
}

export interface BillingPaymentRequest {
  billingKey: string;      // 빌링키
  orderId: string;
  amount: number;
  productName: string;
  buyerName: string;
  buyerEmail: string;
}

export interface VirtualAccountRequest extends PaymentRequest {
  bankCode: string;        // 은행코드
  accountExpiry: string;   // 입금기한 (YYYYMMDDHHmmss)
  cashReceiptType?: string; // 현금영수증 타입 (0:미발행, 1:소득공제, 2:지출증빙)
  cashReceiptId?: string;  // 현금영수증 발행용 식별정보
}

export interface AccountTransferRequest extends PaymentRequest {
  bankCode: string;        // 출금은행코드
  accountNumber: string;   // 출금계좌번호
  accountPassword: string; // 계좌비밀번호
  accountExpiry: string;   // 이체가능시간
}

export class KGMobilians {
  private config: KGConfig;

  constructor(config: KGConfig) {
    this.config = config;
  }

  /**
   * 데이터 암호화 (SHA256 해시)
   */
  private encrypt(data: string): string {
    return CryptoJS.SHA256(data + this.config.merchantKey).toString();
  }

  /**
   * 거래 인증키 생성
   */
  private generateAuthKey(orderId: string, amount: number, timestamp: string): string {
    const data = `${this.config.merchantId}${orderId}${amount}${timestamp}`;
    return this.encrypt(data);
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
   * 카드 일반결제 (보안상 제거 - 결제창 방식 사용)
   * @deprecated 보안상 위험하므로 createPaymentWindow 사용
   */
  async requestCardPayment(request: CardPaymentRequest): Promise<any> {
    throw new Error('보안상 위험하므로 결제창 방식을 사용하세요. createPaymentWindow()를 사용하세요.');
  }

  /**
   * 결제창 생성 (보안 방식)
   */
  async createPaymentWindow(request: PaymentRequest): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.generateAuthKey(request.orderId, request.amount, timestamp);

    const payload = {
      mid: this.config.merchantId,
      orderId: request.orderId,
      amount: request.amount,
      productName: request.productName,
      buyerName: request.buyerName,
      buyerEmail: request.buyerEmail,
      buyerTel: request.buyerTel,
      timestamp: timestamp,
      authKey: authKey,
      returnUrl: request.returnUrl,
      cancelUrl: request.cancelUrl,
    };

    // 결제창 URL 생성
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      params.append(key, value.toString());
    });

    const paymentUrl = `${this.config.apiUrl}/payment?${params.toString()}`;

    return {
      success: true,
      data: {
        paymentUrl: paymentUrl,
        orderId: request.orderId,
        message: '결제창 URL이 생성되었습니다.'
      }
    };
  }

  /**
   * 빌링키 발급 (자동결제 등록)
   */
  async requestBillingKey(request: BillingKeyRequest): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.encrypt(
      `${this.config.merchantId}${request.orderId}${timestamp}`
    );

    const payload = {
      mid: this.config.merchantId,
      orderId: request.orderId,
      cardNumber: request.cardNumber,
      cardExpiry: request.cardExpiry,
      cardPassword: request.cardPassword,
      cardIdNumber: request.cardIdNumber,
      buyerName: request.buyerName,
      buyerEmail: request.buyerEmail,
      buyerTel: request.buyerTel,
      timestamp: timestamp,
      authKey: authKey,
    };

    return await this.apiRequest('/api/billing/key', payload);
  }

  /**
   * 빌링키로 결제 (자동결제)
   */
  async requestBillingPayment(request: BillingPaymentRequest): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.generateAuthKey(request.orderId, request.amount, timestamp);

    const payload = {
      mid: this.config.merchantId,
      billingKey: request.billingKey,
      orderId: request.orderId,
      amount: request.amount,
      productName: request.productName,
      buyerName: request.buyerName,
      buyerEmail: request.buyerEmail,
      timestamp: timestamp,
      authKey: authKey,
    };

    return await this.apiRequest('/api/billing/pay', payload);
  }

  /**
   * URL 결제 링크 생성
   */
  async createPaymentLink(request: PaymentRequest): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.generateAuthKey(request.orderId, request.amount, timestamp);

    const payload = {
      mid: this.config.merchantId,
      orderId: request.orderId,
      amount: request.amount,
      productName: request.productName,
      buyerName: request.buyerName,
      buyerEmail: request.buyerEmail,
      buyerTel: request.buyerTel,
      timestamp: timestamp,
      authKey: authKey,
      returnUrl: request.returnUrl,
      cancelUrl: request.cancelUrl,
    };

    return await this.apiRequest('/api/link/create', payload);
  }

  /**
   * 가상계좌 발급
   */
  async requestVirtualAccount(request: VirtualAccountRequest): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.generateAuthKey(request.orderId, request.amount, timestamp);

    const payload = {
      mid: this.config.merchantId,
      orderId: request.orderId,
      amount: request.amount,
      productName: request.productName,
      buyerName: request.buyerName,
      buyerEmail: request.buyerEmail,
      buyerTel: request.buyerTel,
      bankCode: request.bankCode,
      accountExpiry: request.accountExpiry,
      cashReceiptType: request.cashReceiptType || '0',
      cashReceiptId: request.cashReceiptId || '',
      timestamp: timestamp,
      authKey: authKey,
      returnUrl: request.returnUrl,
    };

    return await this.apiRequest('/api/vaccount/issue', payload);
  }

  /**
   * 가상계좌 입금 확인
   */
  async checkVirtualAccountDeposit(orderId: string): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.encrypt(
      `${this.config.merchantId}${orderId}${timestamp}`
    );

    const payload = {
      mid: this.config.merchantId,
      orderId: orderId,
      timestamp: timestamp,
      authKey: authKey,
    };

    return await this.apiRequest('/api/vaccount/status', payload);
  }

  /**
   * 계좌이체 결제
   */
  async requestAccountTransfer(request: AccountTransferRequest): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.generateAuthKey(request.orderId, request.amount, timestamp);

    const payload = {
      mid: this.config.merchantId,
      orderId: request.orderId,
      amount: request.amount,
      productName: request.productName,
      buyerName: request.buyerName,
      buyerEmail: request.buyerEmail,
      buyerTel: request.buyerTel,
      bankCode: request.bankCode,
      accountNumber: request.accountNumber,
      accountPassword: request.accountPassword,
      accountExpiry: request.accountExpiry,
      timestamp: timestamp,
      authKey: authKey,
      returnUrl: request.returnUrl,
    };

    return await this.apiRequest('/api/account/transfer', payload);
  }

  /**
   * 결제 취소
   */
  async cancelPayment(orderId: string, amount: number, reason: string): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.generateAuthKey(orderId, amount, timestamp);

    const payload = {
      mid: this.config.merchantId,
      orderId: orderId,
      amount: amount,
      reason: reason,
      timestamp: timestamp,
      authKey: authKey,
    };

    return await this.apiRequest('/api/payment/cancel', payload);
  }

  /**
   * 결제 상태 조회
   */
  async getPaymentStatus(orderId: string): Promise<any> {
    const timestamp = new Date().getTime().toString();
    const authKey = this.encrypt(
      `${this.config.merchantId}${orderId}${timestamp}`
    );

    const payload = {
      mid: this.config.merchantId,
      orderId: orderId,
      timestamp: timestamp,
      authKey: authKey,
    };

    return await this.apiRequest('/api/payment/status', payload);
  }

  /**
   * API 요청 실행
   */
  private async apiRequest(endpoint: string, payload: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${data.message || response.statusText}`);
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
 * 은행 코드 맵
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
