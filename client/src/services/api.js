import axios from 'axios';

// API 기본 URL - 환경변수 또는 기본값 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 환경변수 확인 로그
console.log('API Base URL:', API_BASE_URL);
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD
});

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 카드결제 API
export const cardPaymentAPI = {
  // 카드 일반결제
  pay: (data) => api.post('/api/card/pay', data),
  
  // 결제 상태 조회
  getStatus: (orderId) => api.get(`/api/card/status/${orderId}`),
  
  // 결제 취소
  cancel: (data) => api.post('/api/card/cancel', data),
};

// 자동결제(빌링) API
export const billingAPI = {
  // 빌링키 발급
  requestKey: (data) => api.post('/api/billing/key', data),
  
  // 빌링키로 결제
  pay: (data) => api.post('/api/billing/pay', data),
  
  // 빌링키 삭제
  deleteKey: (billingKey) => api.delete(`/api/billing/key/${billingKey}`),
};

// URL 결제 API
export const linkPaymentAPI = {
  // 결제 링크 생성
  create: (data) => api.post('/api/link/create', data),
  
  // 결제 상태 조회
  getStatus: (orderId) => api.get(`/api/link/status/${orderId}`),
};

// 가상계좌 API
export const vAccountAPI = {
  // 가상계좌 발급
  issue: (data) => api.post('/api/vaccount/issue', data),
  
  // 입금 상태 조회
  getStatus: (orderId) => api.get(`/api/vaccount/status/${orderId}`),
  
  // 지원 은행 목록
  getBanks: () => api.get('/api/vaccount/banks'),
};

// 계좌이체 API
export const accountTransferAPI = {
  // 계좌이체 결제
  transfer: (data) => api.post('/api/account/transfer', data),
  
  // 이체 상태 조회
  getStatus: (orderId) => api.get(`/api/account/status/${orderId}`),
  
  // 지원 은행 목록
  getBanks: () => api.get('/api/account/banks'),
};

// 헬스체크
export const healthCheck = () => api.get('/health');

export default api;
