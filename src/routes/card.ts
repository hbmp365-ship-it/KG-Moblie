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
    const kg = new KGMobilians({
      merchantId: env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://testpay.kgmobilians.com',
    });

    // 결제창 URL 생성
    const result = await kg.createPaymentWindow({
      orderId: body.orderId,
      amount: Number(body.amount),
      productName: body.productName,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      buyerTel: body.buyerTel,
      returnUrl: body.returnUrl || `${c.req.header('origin')}/payment/result`,
      cancelUrl: body.cancelUrl || `${c.req.header('origin')}/payment/cancel`,
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
      merchantId: env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://testpay.kgmobilians.com',
    });

    const result = await kg.getPaymentStatus(orderId);
    return c.json(result);
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
    
    if (!body.orderId || !body.amount || !body.reason) {
      return c.json({
        success: false,
        error: 'orderId, amount, reason are required'
      }, 400);
    }

    const env = c.env as Env;
    const kg = new KGMobilians({
      merchantId: env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://testpay.kgmobilians.com',
    });

    const result = await kg.cancelPayment(
      body.orderId,
      Number(body.amount),
      body.reason
    );

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
