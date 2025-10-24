import { Hono } from 'hono';
import { KGMobilians } from '../lib/kgmobilians';

const link = new Hono();

/**
 * URL 결제 링크 생성
 * POST /api/link/create
 */
link.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증
    const requiredFields = [
      'orderId', 'amount', 'productName', 'buyerName',
      'buyerEmail', 'buyerTel', 'returnUrl'
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

    const result = await kg.createPaymentLink({
      orderId: body.orderId,
      amount: Number(body.amount),
      productName: body.productName,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      buyerTel: body.buyerTel,
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
 * URL 결제 링크 조회
 * GET /api/link/status/:orderId
 */
link.get('/status/:orderId', async (c) => {
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

export default link;
