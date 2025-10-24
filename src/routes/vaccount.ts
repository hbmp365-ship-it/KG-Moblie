import { Hono } from 'hono';
import { KGMobilians, BANK_CODES } from '../lib/kgmobilians';

const vaccount = new Hono();

/**
 * 가상계좌 발급
 * POST /api/vaccount/issue
 */
vaccount.post('/issue', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증
    const requiredFields = [
      'orderId', 'amount', 'productName', 'buyerName',
      'buyerEmail', 'buyerTel', 'bankCode', 'accountExpiry'
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

    const result = await kg.requestVirtualAccount({
      orderId: body.orderId,
      amount: Number(body.amount),
      productName: body.productName,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      buyerTel: body.buyerTel,
      bankCode: body.bankCode,
      accountExpiry: body.accountExpiry,
      cashReceiptType: body.cashReceiptType,
      cashReceiptId: body.cashReceiptId,
      returnUrl: body.returnUrl,
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
 * 가상계좌 입금 상태 조회
 * GET /api/vaccount/status/:orderId
 */
vaccount.get('/status/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');

    const kg = new KGMobilians({
      merchantId: c.env?.KG_MERCHANT_ID || 'TEST_MID',
      merchantKey: c.env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: c.env?.KG_API_URL || 'https://testpay.kgmobilians.com',
    });

    const result = await kg.checkVirtualAccountDeposit(orderId);
    return c.json(result);
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * 지원 은행 목록 조회
 * GET /api/vaccount/banks
 */
vaccount.get('/banks', (c) => {
  return c.json({
    success: true,
    banks: Object.entries(BANK_CODES).map(([name, code]) => ({
      name,
      code
    }))
  });
});

export default vaccount;
