import { useState, useEffect } from 'react';
import { vAccountAPI } from '../services/api';

function VirtualAccount() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    orderId: 'VA' + Date.now(),
    amount: '10000',
    productName: '가상계좌 상품',
    buyerName: '홍길동',
    buyerEmail: 'test@example.com',
    buyerTel: '01012345678',
    bankCode: '004',
    accountExpiry: '',
    cashReceiptType: '0',
    cashReceiptId: '',
    returnUrl: window.location.origin + '/payment/result'
  });

  useEffect(() => {
    loadBanks();
    setDefaultExpiry();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await vAccountAPI.getBanks();
      if (response.data.banks) {
        setBanks(response.data.banks);
      }
    } catch (error) {
      console.error('은행 목록 로드 실패:', error);
    }
  };

  const setDefaultExpiry = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7일 후
    const expiry = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      '235959';
    setFormData(prev => ({ ...prev, accountExpiry: expiry }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await vAccountAPI.issue(formData);
      setResult({ success: true, data: response.data });
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.response?.data || error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const response = await vAccountAPI.getStatus(formData.orderId);
      setResult({ success: true, data: response.data });
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.response?.data || error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewOrderId = () => {
    setFormData(prev => ({ ...prev, orderId: 'VA' + Date.now() }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🏦 가상계좌</h1>
      <p className="page-description">
        가상계좌를 발급하여 은행 이체로 결제할 수 있습니다.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>주문번호</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              onClick={generateNewOrderId}
              className="btn btn-secondary"
              style={{ minWidth: '120px' }}
            >
              🔄 새로 생성
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>결제금액</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>상품명</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>구매자명</label>
            <input
              type="text"
              name="buyerName"
              value={formData.buyerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="buyerEmail"
              value={formData.buyerEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>전화번호</label>
            <input
              type="tel"
              name="buyerTel"
              value={formData.buyerTel}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>입금 은행</label>
            <select
              name="bankCode"
              value={formData.bankCode}
              onChange={handleChange}
              required
            >
              {banks.length === 0 ? (
                <option value="">로딩중...</option>
              ) : (
                banks.map(bank => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name} ({bank.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>입금기한</label>
            <input
              type="text"
              name="accountExpiry"
              value={formData.accountExpiry}
              onChange={handleChange}
              placeholder="20251231235959"
              required
            />
            <small>YYYYMMDDHHmmss 형식</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>현금영수증 타입</label>
            <select
              name="cashReceiptType"
              value={formData.cashReceiptType}
              onChange={handleChange}
            >
              <option value="0">미발행</option>
              <option value="1">소득공제</option>
              <option value="2">지출증빙</option>
            </select>
          </div>

          <div className="form-group">
            <label>현금영수증 식별정보</label>
            <input
              type="text"
              name="cashReceiptId"
              value={formData.cashReceiptId}
              onChange={handleChange}
              placeholder="휴대폰번호 또는 사업자번호"
            />
            <small>현금영수증 발행 시 필수</small>
          </div>
        </div>

        <div className="button-group">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                처리중...
              </>
            ) : (
              <>🏦 가상계좌 발급</>
            )}
          </button>

          <button 
            type="button"
            onClick={handleCheckStatus}
            className="btn btn-secondary"
            disabled={loading}
          >
            📊 입금 상태 조회
          </button>
        </div>
      </form>

      {result && (
        <div className="result-box">
          <h3>{result.success ? '✅ 성공' : '❌ 실패'}</h3>
          
          {result.success && result.data?.data?.accountNumber && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '1.5rem', 
              backgroundColor: '#d4edda', 
              borderRadius: '8px',
              border: '1px solid #c3e6cb'
            }}>
              <h4 style={{ color: '#155724', marginBottom: '1rem' }}>
                🎉 가상계좌가 발급되었습니다!
              </h4>
              <div style={{ color: '#155724', lineHeight: '2' }}>
                <strong>은행:</strong> {result.data.data.bankName}<br/>
                <strong>계좌번호:</strong> <span style={{ fontSize: '1.2rem' }}>{result.data.data.accountNumber}</span><br/>
                <strong>입금금액:</strong> {Number(result.data.data.amount).toLocaleString()}원<br/>
                <strong>입금자명:</strong> {result.data.data.depositorName}<br/>
                <strong>입금기한:</strong> {result.data.data.expiry}
              </div>
            </div>
          )}
          
          <pre>{JSON.stringify(result.success ? result.data : result.error, null, 2)}</pre>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#fff3cd', 
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#856404' }}>💡 사용 방법</h3>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: '#856404' }}>
          <li>결제 정보를 입력하고 "가상계좌 발급" 버튼을 클릭합니다.</li>
          <li>발급된 가상계좌 정보를 고객에게 안내합니다.</li>
          <li>고객이 지정된 계좌로 입금하면 자동으로 결제가 완료됩니다.</li>
          <li>"입금 상태 조회"로 입금 완료 여부를 확인할 수 있습니다.</li>
          <li>입금기한이 지나면 가상계좌는 자동으로 만료됩니다.</li>
        </ol>
      </div>
    </div>
  );
}

export default VirtualAccount;
