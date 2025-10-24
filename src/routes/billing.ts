import { Hono } from 'hono';
import { KGMobilians } from '../lib/kgmobilians';

const billing = new Hono();

/**
 * 빌링키 발급 (자동결제 등록)
 * POST /api/billing/key
 */
billing.post('/key', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증
    const requiredFields = [
      'orderId', 'cardNumber', 'cardExpiry', 'cardPassword',
      'cardIdNumber', 'buyerName', 'buyerEmail', 'buyerTel'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400);
      }
    }

    const kg = new KGMobilians({
      merchantId: c.env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: c.env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: c.env?.KG_API_URL || 'https://testpay.kgmobilians.com',
    });

    const result = await kg.requestBillingKey({
      orderId: body.orderId,
      cardNumber: body.cardNumber,
      cardExpiry: body.cardExpiry,
      cardPassword: body.cardPassword,
      cardIdNumber: body.cardIdNumber,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      buyerTel: body.buyerTel,
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

    const kg = new KGMobilians({
      merchantId: c.env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: c.env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: c.env?.KG_API_URL || 'https://testpay.kgmobilians.com',
    });

    const result = await kg.requestBillingPayment({
      billingKey: body.billingKey,
      orderId: body.orderId,
      amount: Number(body.amount),
      productName: body.productName,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
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
