import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// 라우터 import
import payment from './routes/payment';
import card from './routes/card';
import billing from './routes/billing';
import link from './routes/link';
import vaccount from './routes/vaccount';
import account from './routes/account';

const app = new Hono();

// 미들웨어 설정
app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', cors());

// API 라우터 등록
app.route('/api/payment', payment);  // 통합 결제 API (권장)
app.route('/api/card', card);        // 레거시 카드결제 API
app.route('/api/billing', billing);  // 레거시 빌링 API
app.route('/api/link', link);        // 레거시 URL결제 API
app.route('/api/vaccount', vaccount);// 레거시 가상계좌 API
app.route('/api/account', account);  // 레거시 계좌이체 API

// 메인 페이지 (결제 테스트 UI)
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KG모빌리언스 결제 시스템</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <!-- 헤더 -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 class="text-3xl font-bold text-gray-800 flex items-center">
                    <i class="fas fa-credit-card mr-3 text-blue-600"></i>
                    KG모빌리언스 통합 결제 시스템
                </h1>
                <p class="text-gray-600 mt-2">하나의 결제창에서 카드, 가상계좌, 계좌이체 등 모든 결제 수단을 지원합니다.</p>
                <div class="mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-700">
                    <i class="fas fa-info-circle mr-2"></i>
                    <strong>통합 결제창 방식:</strong> /api/payment/request로 거래 등록하면 사용자가 결제창에서 원하는 결제 수단을 선택할 수 있습니다.
                </div>
            </div>

            <!-- API 엔드포인트 목록 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 통합 결제 (권장) -->
                <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white col-span-2">
                    <h2 class="text-2xl font-bold mb-4 flex items-center">
                        <i class="fas fa-star mr-2"></i>
                        통합 결제 API (권장)
                    </h2>
                    <div class="space-y-2 text-sm">
                        <div class="bg-white bg-opacity-20 p-3 rounded">
                            <span class="font-mono text-yellow-200">POST /api/payment/request</span>
                            <p class="mt-1">거래 등록 및 결제창 URL 생성 (모든 결제 수단 지원)</p>
                        </div>
                        <div class="bg-white bg-opacity-20 p-3 rounded">
                            <span class="font-mono text-yellow-200">POST /api/payment/approval</span>
                            <p class="mt-1">결제 승인 (hybrid_pay='Y'인 경우)</p>
                        </div>
                        <div class="bg-white bg-opacity-20 p-3 rounded">
                            <span class="font-mono text-yellow-200">POST /api/payment/cancel</span>
                            <p class="mt-1">결제 취소</p>
                        </div>
                    </div>
                </div>

                <!-- 카드결제 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-credit-card mr-2 text-blue-500"></i>
                        카드결제
                    </h2>
                    <div class="space-y-2 text-sm">
                        <div class="bg-blue-50 p-3 rounded">
                            <span class="font-mono text-blue-700">POST /api/card/pay</span>
                            <p class="text-gray-600 mt-1">카드 일반결제</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="font-mono text-gray-700">GET /api/card/status/:orderId</span>
                            <p class="text-gray-600 mt-1">결제 상태 조회</p>
                        </div>
                        <div class="bg-red-50 p-3 rounded">
                            <span class="font-mono text-red-700">POST /api/card/cancel</span>
                            <p class="text-gray-600 mt-1">결제 취소</p>
                        </div>
                    </div>
                </div>

                <!-- 자동결제 (빌링) -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-sync-alt mr-2 text-green-500"></i>
                        자동결제 (빌링)
                    </h2>
                    <div class="space-y-2 text-sm">
                        <div class="bg-green-50 p-3 rounded">
                            <span class="font-mono text-green-700">POST /api/billing/key</span>
                            <p class="text-gray-600 mt-1">빌링키 발급</p>
                        </div>
                        <div class="bg-blue-50 p-3 rounded">
                            <span class="font-mono text-blue-700">POST /api/billing/pay</span>
                            <p class="text-gray-600 mt-1">빌링키로 결제</p>
                        </div>
                        <div class="bg-red-50 p-3 rounded">
                            <span class="font-mono text-red-700">DELETE /api/billing/key/:billingKey</span>
                            <p class="text-gray-600 mt-1">빌링키 삭제</p>
                        </div>
                    </div>
                </div>

                <!-- URL 결제 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-link mr-2 text-purple-500"></i>
                        URL 결제
                    </h2>
                    <div class="space-y-2 text-sm">
                        <div class="bg-purple-50 p-3 rounded">
                            <span class="font-mono text-purple-700">POST /api/link/create</span>
                            <p class="text-gray-600 mt-1">결제 링크 생성</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="font-mono text-gray-700">GET /api/link/status/:orderId</span>
                            <p class="text-gray-600 mt-1">결제 상태 조회</p>
                        </div>
                    </div>
                </div>

                <!-- 가상계좌 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-university mr-2 text-yellow-500"></i>
                        가상계좌
                    </h2>
                    <div class="space-y-2 text-sm">
                        <div class="bg-yellow-50 p-3 rounded">
                            <span class="font-mono text-yellow-700">POST /api/vaccount/issue</span>
                            <p class="text-gray-600 mt-1">가상계좌 발급</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="font-mono text-gray-700">GET /api/vaccount/status/:orderId</span>
                            <p class="text-gray-600 mt-1">입금 상태 조회</p>
                        </div>
                        <div class="bg-blue-50 p-3 rounded">
                            <span class="font-mono text-blue-700">GET /api/vaccount/banks</span>
                            <p class="text-gray-600 mt-1">지원 은행 목록</p>
                        </div>
                    </div>
                </div>

                <!-- 계좌이체 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-exchange-alt mr-2 text-indigo-500"></i>
                        계좌이체
                    </h2>
                    <div class="space-y-2 text-sm">
                        <div class="bg-indigo-50 p-3 rounded">
                            <span class="font-mono text-indigo-700">POST /api/account/transfer</span>
                            <p class="text-gray-600 mt-1">계좌이체 결제</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="font-mono text-gray-700">GET /api/account/status/:orderId</span>
                            <p class="text-gray-600 mt-1">이체 상태 조회</p>
                        </div>
                        <div class="bg-blue-50 p-3 rounded">
                            <span class="font-mono text-blue-700">GET /api/account/banks</span>
                            <p class="text-gray-600 mt-1">지원 은행 목록</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 환경변수 설정 안내 -->
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 mt-6 rounded">
                <div class="flex items-start">
                    <i class="fas fa-exclamation-triangle text-yellow-400 mt-1 mr-3"></i>
                    <div>
                        <h3 class="text-lg font-bold text-yellow-800 mb-2">환경변수 설정 필요</h3>
                        <p class="text-yellow-700 mb-2">다음 환경변수를 설정해야 합니다:</p>
                        <ul class="list-disc list-inside text-yellow-700 space-y-1">
                            <li><code class="bg-yellow-100 px-2 py-1 rounded">KG_SID</code> - KG모빌리언스 서비스 ID (가맹점 코드)</li>
                            <li><code class="bg-yellow-100 px-2 py-1 rounded">KG_MERCHANT_KEY</code> - KG모빌리언스 상점 키</li>
                            <li><code class="bg-yellow-100 px-2 py-1 rounded">KG_API_URL</code> - API URL (테스트: test.mobilians.co.kr, 운영: mup.mobilians.co.kr)</li>
                            <li><code class="bg-yellow-100 px-2 py-1 rounded">KG_SITE_URL</code> - 가맹점 사이트 URL</li>
                        </ul>
                        <p class="text-yellow-700 mt-3">
                            <strong>로컬 개발:</strong> <code class="bg-yellow-100 px-2 py-1 rounded">.dev.vars</code> 파일에 설정<br>
                            <strong>프로덕션:</strong> <code class="bg-yellow-100 px-2 py-1 rounded">wrangler secret put</code> 명령어로 설정
                        </p>
                    </div>
                </div>
            </div>

            <!-- 테스트 섹션 -->
            <div class="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-vial mr-3 text-green-600"></i>
                    API 테스트
                </h2>
                
                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">API 선택</label>
                    <select id="apiSelect" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="payment-unified">통합 결제 (권장)</option>
                        <option value="payment-unified-card">통합 결제 - 카드만</option>
                        <option value="payment-unified-va">통합 결제 - 가상계좌만</option>
                        <option value="payment-cancel">결제 취소</option>
                        <option disabled>--- 레거시 API ---</option>
                        <option value="card">카드결제 (레거시)</option>
                        <option value="billing-key">빌링키 발급 (레거시)</option>
                        <option value="billing-pay">빌링 결제 (레거시)</option>
                        <option value="link">URL 결제 링크 (레거시)</option>
                        <option value="vaccount">가상계좌 발급 (레거시)</option>
                        <option value="account">계좌이체 (레거시)</option>
                    </select>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 font-medium mb-2">요청 데이터 (JSON)</label>
                    <textarea id="requestData" rows="10" class="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                </div>

                <button onclick="sendRequest()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <i class="fas fa-paper-plane mr-2"></i>
                    요청 보내기
                </button>

                <div id="response" class="mt-4 hidden">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">응답</h3>
                    <pre class="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto text-sm"></pre>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        const apiExamples = {
            'payment-unified': {
                url: '/api/payment/request',
                method: 'POST',
                data: {
                    tradeId: 'TRD' + Date.now(),
                    amount: 10000,
                    productName: '테스트 상품',
                    userName: '홍길동',
                    userEmail: 'test@example.com',
                    okUrl: window.location.origin + '/api/payment/result',
                    closeUrl: window.location.origin + '/payment/cancel',
                    failUrl: window.location.origin + '/payment/fail',
                    callType: 'P',
                    hybridPay: 'N'
                }
            },
            'payment-unified-card': {
                url: '/api/payment/request',
                method: 'POST',
                data: {
                    tradeId: 'TRD' + Date.now(),
                    amount: 10000,
                    productName: '테스트 상품',
                    userName: '홍길동',
                    userEmail: 'test@example.com',
                    okUrl: window.location.origin + '/api/payment/result',
                    cashCode: 'CN',
                    callType: 'P',
                    hybridPay: 'N'
                }
            },
            'payment-unified-va': {
                url: '/api/payment/request',
                method: 'POST',
                data: {
                    tradeId: 'TRD' + Date.now(),
                    amount: 10000,
                    productName: '테스트 상품',
                    userName: '홍길동',
                    userEmail: 'test@example.com',
                    okUrl: window.location.origin + '/api/payment/result',
                    notiUrl: window.location.origin + '/api/payment/webhook',
                    cashCode: 'VA',
                    callType: 'P',
                    hybridPay: 'N'
                }
            },
            'payment-cancel': {
                url: '/api/payment/cancel',
                method: 'POST',
                data: {
                    tradeId: 'TRD1234567890',
                    cashCode: 'CN',
                    amount: 10000,
                    payToken: 'PAY_TOKEN_HERE',
                    cancelType: 'C',
                    partCancel: 'N'
                }
            },
            card: {
                url: '/api/card/pay',
                method: 'POST',
                data: {
                    orderId: 'ORD' + Date.now(),
                    amount: 10000,
                    productName: '테스트 상품',
                    buyerName: '홍길동',
                    buyerEmail: 'test@example.com',
                    buyerTel: '01012345678',
                    cardNumber: '1234567812345678',
                    cardExpiry: '2512',
                    cardPassword: '12',
                    cardIdNumber: '900101',
                    installment: '00',
                    returnUrl: window.location.origin + '/payment/result'
                }
            },
            'billing-key': {
                url: '/api/billing/key',
                method: 'POST',
                data: {
                    orderId: 'BILL' + Date.now(),
                    cardNumber: '1234567812345678',
                    cardExpiry: '2512',
                    cardPassword: '12',
                    cardIdNumber: '900101',
                    buyerName: '홍길동',
                    buyerEmail: 'test@example.com',
                    buyerTel: '01012345678'
                }
            },
            'billing-pay': {
                url: '/api/billing/pay',
                method: 'POST',
                data: {
                    billingKey: 'BILLING_KEY_HERE',
                    orderId: 'AUTO' + Date.now(),
                    amount: 10000,
                    productName: '정기결제 상품',
                    buyerName: '홍길동',
                    buyerEmail: 'test@example.com'
                }
            },
            link: {
                url: '/api/link/create',
                method: 'POST',
                data: {
                    orderId: 'LINK' + Date.now(),
                    amount: 10000,
                    productName: 'URL 결제 상품',
                    buyerName: '홍길동',
                    buyerEmail: 'test@example.com',
                    buyerTel: '01012345678',
                    returnUrl: window.location.origin + '/payment/result',
                    cancelUrl: window.location.origin + '/payment/cancel'
                }
            },
            vaccount: {
                url: '/api/vaccount/issue',
                method: 'POST',
                data: {
                    orderId: 'VA' + Date.now(),
                    amount: 10000,
                    productName: '가상계좌 상품',
                    buyerName: '홍길동',
                    buyerEmail: 'test@example.com',
                    buyerTel: '01012345678',
                    bankCode: '004',
                    accountExpiry: '20251231235959',
                    cashReceiptType: '1',
                    cashReceiptId: '01012345678',
                    returnUrl: window.location.origin + '/payment/result'
                }
            },
            account: {
                url: '/api/account/transfer',
                method: 'POST',
                data: {
                    orderId: 'AT' + Date.now(),
                    amount: 10000,
                    productName: '계좌이체 상품',
                    buyerName: '홍길동',
                    buyerEmail: 'test@example.com',
                    buyerTel: '01012345678',
                    bankCode: '004',
                    accountNumber: '12345678901234',
                    accountPassword: '1234',
                    accountExpiry: '20251231235959',
                    returnUrl: window.location.origin + '/payment/result'
                }
            }
        };

        document.getElementById('apiSelect').addEventListener('change', function() {
            const example = apiExamples[this.value];
            document.getElementById('requestData').value = JSON.stringify(example.data, null, 2);
        });

        // 초기값 설정
        document.getElementById('requestData').value = JSON.stringify(apiExamples['payment-unified'].data, null, 2);

        async function sendRequest() {
            const apiType = document.getElementById('apiSelect').value;
            const requestData = document.getElementById('requestData').value;
            const responseDiv = document.getElementById('response');
            const responsePre = responseDiv.querySelector('pre');

            try {
                const data = JSON.parse(requestData);
                const example = apiExamples[apiType];
                
                const response = await axios({
                    method: example.method,
                    url: example.url,
                    data: data
                });

                responsePre.textContent = JSON.stringify(response.data, null, 2);
                responseDiv.classList.remove('hidden');
            } catch (error) {
                responsePre.textContent = JSON.stringify({
                    error: error.message,
                    details: error.response?.data || 'No additional details'
                }, null, 2);
                responseDiv.classList.remove('hidden');
            }
        }
    </script>
</body>
</html>
  `);
});

// 헬스체크
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default app;
