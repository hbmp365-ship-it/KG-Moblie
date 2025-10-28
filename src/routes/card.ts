import { Hono } from 'hono';
import { KGMobilians } from '../lib/kgmobilians';
import { Env } from '../types/env';

const card = new Hono();

/**
 * 카드 결제창 요청 API
 * POST /api/card/pay
 */
card.post('/pay', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증 (카드 정보 제외)
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
    
    console.log('환경변수 확인:', {
      KG_SID: env?.KG_SID || '없음',
      KG_MERCHANT_KEY: env?.KG_MERCHANT_KEY ? '설정됨' : '없음',
      KG_API_URL: env?.KG_API_URL || '없음',
      clientOrigin: clientOrigin
    });
    
    const kg = new KGMobilians({
      sid: env?.KG_SID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001', // 환경변수에서 가져오기
    });

    console.log('siteUrl:', env?.KG_SITE_URL || 'http://localhost:3001');
    // REST API 방식으로 결제창 생성
    const result = await kg.registration({
      // 필수 필드 (Y)
      tradeId: body.orderId,                    // 가맹점 거래번호 (40자)
      productName: body.productName,            // 상품명 (50자)
      amount: Number(body.amount),              // 총 결제 금액
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001', // 환경변수에서 가져오기 (20자)
      okUrl: body.returnUrl || `${clientOrigin}/payment/result`, // 결제 완료 URL (128자)
      
      // 선택적 필드 (N) - 카드결제에 필요한 것들만
      cashCode: 'CN',                         // 결제 수단: CN(신용카드)
      callType: 'P',                          // P: popup, S: self, I: iframe
      hybridPay: 'N',                         // N: 인증+승인, Y: 인증만
      closeUrl: body.cancelUrl || `${clientOrigin}/payment/cancel`, // 취소 URL (128자)
      userName: body.buyerName,               // 사용자 이름 (50자)
      userEmail: body.buyerEmail,             // 사용자 이메일 (30자)
      
      // 선택적 필드 (N) - 주석 처리 (필요시 활성화)
      // notiUrl: `${clientOrigin}/api/card/webhook`, // 결제 결과 노티 URL (128자)
      // notiEmail: 'admin@example.com',              // 담당자 이메일 (30자)
      // failUrl: `${clientOrigin}/payment/fail`,      // 결제 실패 URL (128자)
      // userId: 'user123',                           // 사용자 ID (50자)
      // businessNo: '1234567890123',                 // 사업자번호 (13자)
      // sellerTel: '01012345678',                    // 판매자 전화번호 (15자)
      // sellerName: '판매자명',                       // 판매자명 (50자)
      // onlyOnce: 'Y',                               // 반복결제 설정: Y(단건), N(다건)
      // timeStamp: '20250101120000',                 // 유효시간 (14자)
      // mstr: 'orderId=123|userId=456',              // 가맹점 콜백 변수 (2000자)
      // cpLogo: 'N',                                // 가맹점 로고 표기: Y/N
      // cssType: '#006EB9',                         // 결제창 색상 (7자)
      // cpUi: 'custom_ui',                          // 가맹점별 UI 설정 (20자)
      // appScheme: 'myapp://',                       // APP URL Scheme (50자)
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
 * 카드결제 결과 조회
 * GET /api/card/status/:orderId
 */
card.get('/status/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');

    const env = c.env as Env;
    const kg = new KGMobilians({
      sid: env?.KG_SID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001',
    });

    // TODO: 결제 상태 조회 API 구현 필요
    return c.json({
      success: false,
      error: '결제 상태 조회 API는 아직 구현되지 않았습니다.'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * 카드결제 취소
 * POST /api/card/cancel
 */
card.post('/cancel', async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.tradeId || !body.amount || !body.cashCode || !body.payToken) {
      return c.json({
        success: false,
        error: 'tradeId, amount, cashCode, payToken are required'
      }, 400);
    }

    const env = c.env as Env;
    const kg = new KGMobilians({
      sid: env?.KG_SID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || 'http://localhost:3001',
    });

    const result = await kg.cancellation({
      tradeId: body.tradeId,
      cashCode: body.cashCode,
      amount: Number(body.amount),
      payToken: body.payToken,
      cancelType: 'C',
      partCancel: body.partCancel || 'N',
      billType: body.billType,
      tax: body.tax,
      taxFree: body.taxFree,
      taxAmount: body.taxAmount,
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
 * KG모빌리언스 웹훅 (결제 결과 수신)
 * POST /api/card/webhook
 */
card.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    
    // console.log('KG모빌리언스 웹훅 수신:', body);
    
    // 웹훅 검증 (실제 구현에서는 서명 검증 필요)
    // const isValid = kg.verifyWebhookSignature(body);
    // if (!isValid) {
    //   return c.json({ success: false, error: 'Invalid signature' }, 400);
    // }
    
    // 결제 결과 처리
    const { orderId, status, amount, transactionId } = body;
    
    // TODO: 데이터베이스에 결제 결과 저장
    // await savePaymentResult({
    //   orderId,
    //   status,
    //   amount,
    //   transactionId,
    //   receivedAt: new Date()
    // });
    
    return c.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    // console.error('웹훅 처리 오류:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default card;
