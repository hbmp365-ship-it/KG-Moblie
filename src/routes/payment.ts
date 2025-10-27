import { Hono } from 'hono';
import { KGMobilians } from '../lib/kgmobilians';
import { Env } from '../types/env';

const payment = new Hono();

/**
 * 통합 결제창 요청 API
 * POST /api/payment/request
 * 
 * 하나의 결제창에서 모든 결제 수단(카드, 가상계좌, 계좌이체 등)을 선택할 수 있습니다.
 */
payment.post('/request', async (c) => {
  try {
    const body = await c.req.json();
    
    // 필수 파라미터 검증
    const requiredFields = [
      'tradeId', 'amount', 'productName', 'userName', 'okUrl'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400);
      }
    }

    // KG모빌리언스 설정
    const env = c.env as Env;
    const kg = new KGMobilians({
      sid: env?.KG_SID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || c.req.header('origin') || 'http://localhost:3000',
    });

    // 거래 등록
    const result = await kg.registration({
      tradeId: body.tradeId,
      amount: Number(body.amount),
      productName: body.productName,
      userName: body.userName,
      userEmail: body.userEmail,
      okUrl: body.okUrl,
      closeUrl: body.closeUrl,
      failUrl: body.failUrl,
      notiUrl: body.notiUrl,
      cashCode: body.cashCode,  // 선택사항: 특정 결제 수단만 표시
      callType: body.callType || 'P',  // P:팝업, S:self, I:iframe
      hybridPay: body.hybridPay || 'N',  // Y:인증만, N:인증+승인
      mstr: body.mstr,
    });

    if (!result.success) {
      return c.json(result, 400);
    }

    return c.json({
      success: true,
      tid: result.tid,
      paymentUrl: result.paymentUrl,
      message: '결제창이 생성되었습니다. paymentUrl로 결제를 진행하세요.'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * 결제 승인 API (hybrid_pay='Y'인 경우 사용)
 * POST /api/payment/approval
 * 
 * 인증만 처리한 경우(hybrid_pay=Y) ok_url에서 받은 결제 정보로 최종 승인 처리
 */
payment.post('/approval', async (c) => {
  try {
    const body = await c.req.json();
    
    const requiredFields = ['tid', 'cashCode', 'amount', 'payToken'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400);
      }
    }

    const env = c.env as Env;
    const kg = new KGMobilians({
      sid: env?.KG_SID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || c.req.header('origin') || 'http://localhost:3000',
    });

    const result = await kg.approval({
      tid: body.tid,
      cashCode: body.cashCode,
      amount: Number(body.amount),
      payToken: body.payToken,
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
 * 결제 취소 API
 * POST /api/payment/cancel
 */
payment.post('/cancel', async (c) => {
  try {
    const body = await c.req.json();
    
    const requiredFields = ['tradeId', 'cashCode', 'amount', 'payToken'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400);
      }
    }

    const env = c.env as Env;
    const kg = new KGMobilians({
      sid: env?.KG_SID || 'TEST_SID',
      merchantKey: env?.KG_MERCHANT_KEY || 'TEST_KEY',
      apiUrl: env?.KG_API_URL || 'https://test.mobilians.co.kr',
      siteUrl: env?.KG_SITE_URL || c.req.header('origin') || 'http://localhost:3000',
    });

    const result = await kg.cancellation({
      tradeId: body.tradeId,
      cashCode: body.cashCode,
      amount: Number(body.amount),
      payToken: body.payToken,
      cancelType: 'C',
      partCancel: body.partCancel || 'N',
      billType: body.billType,
      tax: body.tax ? Number(body.tax) : undefined,
      taxFree: body.taxFree ? Number(body.taxFree) : undefined,
      taxAmount: body.taxAmount ? Number(body.taxAmount) : undefined,
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
 * KG모빌리언스 결제 결과 웹훅
 * POST /api/payment/webhook
 */
payment.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    
    console.log('KG모빌리언스 웹훅 수신:', body);
    
    // TODO: 웹훅 검증 (실제 구현에서는 서명 검증 필요)
    // TODO: 데이터베이스에 결제 결과 저장
    
    return c.json({ 
      success: true, 
      message: 'Webhook received' 
    });
  } catch (error: any) {
    console.error('웹훅 처리 오류:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * 결제 결과 처리 페이지
 * GET /api/payment/result
 */
payment.get('/result', async (c) => {
  const tid = c.req.query('tid');
  const resultCode = c.req.query('result_code');
  const resultMsg = c.req.query('result_msg');
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>결제 결과</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
      <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 class="text-2xl font-bold mb-4 ${resultCode === '0000' ? 'text-green-600' : 'text-red-600'}">
          ${resultCode === '0000' ? '✓ 결제 완료' : '✗ 결제 실패'}
        </h1>
        <div class="space-y-2 text-sm">
          <p><strong>거래번호:</strong> ${tid || '-'}</p>
          <p><strong>결과코드:</strong> ${resultCode || '-'}</p>
          <p><strong>메시지:</strong> ${resultMsg || '-'}</p>
        </div>
        <button onclick="window.close()" class="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          닫기
        </button>
      </div>
    </body>
    </html>
  `);
});

export default payment;
