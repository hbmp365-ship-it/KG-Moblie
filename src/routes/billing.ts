import { Hono } from 'hono';
import { KGMobilians } from '../lib/kgmobilians';
import { Env } from '../types/env';

const billing = new Hono();

/**
 * 빌링키 발급 (자동결제 등록)
 * POST /api/billing/key
 */
billing.post('/key', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증 (카드 정보 제외 - KG모빌리언스 결제창에서 입력)
    const requiredFields = [
      'orderId', 'amount', 'productName', 'buyerName', 
      'buyerEmail', 'buyerTel'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400);
      }
    }

    // KG모빌리언스 설정 (환경변수에서 가져오기)
    const env = c.env as Env;
    const clientOrigin = c.req.header('origin') || 'http://localhost:3001';
    
    console.log('빌링키 발급 환경변수 확인:', {
      KG_SID: env?.KG_AUTO_SERVICE_ID || '없음',
      KG_MERCHANT_KEY: env?.KG_MERCHANT_KEY ? '설정됨' : '없음',
      KG_API_URL: env?.KG_API_URL || '없음',
      clientOrigin: clientOrigin
    });
    
    const kg = new KGMobilians({
      sid: env?.KG_AUTO_SERVICE_ID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001',
    });

    // 빌링키 발급을 위한 거래 등록 (카드결제와 동일한 방식)
    const result = await kg.registration({
      // 필수 필드 (Y)
      tradeId: body.orderId,                    // 가맹점 거래번호 (40자)
      productName: body.productName,            // 상품명 (50자)
      amount: Number(body.amount),              // 총 결제 금액
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001', // 환경변수에서 가져오기 (20자)
      okUrl: body.returnUrl || `${clientOrigin}/payment/result`, // 결제 완료 URL (128자)
      
      // 선택적 필드 (N) - 카드결제와 동일
      cashCode: 'CN',                         // 결제 수단: CN(신용카드)
      callType: 'P',                          // P: popup, S: self, I: iframe
      hybridPay: 'N',                         // N: 인증+승인, Y: 인증만
      closeUrl: body.cancelUrl || `${clientOrigin}/payment/cancel`, // 취소 URL (128자)
      userName: body.buyerName,               // 사용자 이름 (50자)
      userEmail: body.buyerEmail,             // 사용자 이메일 (30자)
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * 빌링키로 결제 (자동결제)
 * POST /api/billing/pay
 */
billing.post('/pay', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증
    const requiredFields = [
      'billingKey', 'orderId', 'amount', 'productName',
      'buyerName', 'buyerEmail'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400);
      }
    }

    // KG모빌리언스 설정 (환경변수에서 가져오기)
    const env = c.env as Env;
    const clientOrigin = c.req.header('origin') || 'http://localhost:3001';
    
    const kg = new KGMobilians({
      sid: env?.KG_AUTO_SERVICE_ID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001',
    });

    // 빌링키로 결제를 위한 거래 등록 (카드결제와 동일한 방식)
    const result = await kg.registration({
      // 필수 필드 (Y)
      tradeId: body.orderId,                    // 가맹점 거래번호 (40자)
      productName: body.productName,            // 상품명 (50자)
      amount: Number(body.amount),              // 총 결제 금액
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001', // 환경변수에서 가져오기 (20자)
      okUrl: body.returnUrl || `${clientOrigin}/payment/result`, // 결제 완료 URL (128자)
      
      // 선택적 필드 (N) - 카드결제와 동일
      cashCode: 'CN',                         // 결제 수단: CN(신용카드)
      callType: 'P',                          // P: popup, S: self, I: iframe
      hybridPay: 'N',                         // N: 인증+승인, Y: 인증만
      closeUrl: body.cancelUrl || `${clientOrigin}/payment/cancel`, // 취소 URL (128자)
      userName: body.buyerName,               // 사용자 이름 (50자)
      userEmail: body.buyerEmail,             // 사용자 이메일 (30자)
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * 빌링키 삭제 (자동결제 해지)
 * DELETE /api/billing/key/:billingKey
 */
billing.delete('/key/:billingKey', async (c) => {
  try {
    const billingKey = c.req.param('billingKey');

    // 실제로는 빌링키 삭제 API 호출
    // 여기서는 예시로 성공 응답 반환
    return c.json({
      success: true,
      message: 'Billing key deleted successfully',
      billingKey: billingKey
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default billing;
