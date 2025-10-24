import { Hono } from 'hono';
import { KGMobilians } from '../lib/kgmobilians';

const card = new Hono();

/**
 * 카드 일반결제 API
 * POST /api/card/pay
 */
card.post('/pay', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증
    const requiredFields = [
      'orderId', 'amount', 'productName', 'buyerName', 
      'buyerEmail', 'buyerTel', 'cardNumber', 'cardExpiry',
      'cardPassword', 'cardIdNumber', 'installment'
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
    const kg = new KGMobilians({
      merchantId: c.env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: c.env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: c.env?.KG_API_URL || 'https://testpay.kgmobilians.com',
    });

    // 결제 요청
    const result = await kg.requestCardPayment({
      orderId: body.orderId,
      amount: Number(body.amount),
      productName: body.productName,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      buyerTel: body.buyerTel,
      cardNumber: body.cardNumber,
      cardExpiry: body.cardExpiry,
      cardPassword: body.cardPassword,
      cardIdNumber: body.cardIdNumber,
      installment: body.installment,
      returnUrl: body.returnUrl,
      cancelUrl: body.cancelUrl,
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

    const kg = new KGMobilians({
      merchantId: c.env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: c.env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: c.env?.KG_API_URL || 'https://testpay.kgmobilians.com',
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

    const kg = new KGMobilians({
      merchantId: c.env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: c.env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: c.env?.KG_API_URL || 'https://testpay.kgmobilians.com',
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

export default card;
