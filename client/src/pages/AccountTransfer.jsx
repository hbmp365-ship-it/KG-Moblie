import { useState, useEffect } from 'react';
import { accountTransferAPI } from '../services/api';

function AccountTransfer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    orderId: 'AT' + Date.now(),
    amount: '10000',
    productName: '계좌이체 상품',
    buyerName: '홍길동',
    buyerEmail: 'test@example.com',
    buyerTel: '01012345678',
    bankCode: '004',
    accountNumber: '12345678901234',
    accountPassword: '1234',
    accountExpiry: '',
    returnUrl: window.location.origin + '/payment/result'
  });

  useEffect(() => {
    loadBanks();
    setDefaultExpiry();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await accountTransferAPI.getBanks();
      if (response.data.banks) {
        setBanks(response.data.banks);
      }
    } catch (error) {
      console.error('은행 목록 로드 실패:', error);
    }
  };

  const setDefaultExpiry = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1); // 1시간 후
    const expiry = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      '59';
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
      const response = await accountTransferAPI.transfer(formData);
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
      const response = await accountTransferAPI.getStatus(formData.orderId);
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
    setFormData(prev => ({ ...prev, orderId: 'AT' + Date.now() }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">💸 계좌이체</h1>
      <p className="page-description">
        고객의 계좌에서 직접 이체하여 실시간으로 결제할 수 있습니다.
      </p>

      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f8d7da', 
        borderRadius: '8px',
        border: '1px solid #f5c6cb',
        color: '#721c24'
      }}>
        <strong>⚠️ 주의사항:</strong> 계좌이체는 실제 계좌 정보가 필요하므로 신중하게 사용하세요.
        테스트 환경에서는 실제 이체가 발생하지 않습니다.
      </div>

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
            <label>출금 은행</label>
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
            <label>출금 계좌번호</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="12345678901234"
              required
            />
            <small>하이픈(-) 없이 숫자만 입력</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>계좌 비밀번호</label>
            <input
              type="password"
              name="accountPassword"
              value={formData.accountPassword}
              onChange={handleChange}
              placeholder="****"
              required
            />
            <small>4자리 숫자</small>
          </div>

          <div className="form-group">
            <label>이체가능시간</label>
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
              <>💸 계좌이체 결제</>
            )}
          </button>

          <button 
            type="button"
            onClick={handleCheckStatus}
            className="btn btn-secondary"
            disabled={loading}
          >
            📊 이체 상태 조회
          </button>
        </div>
      </form>

      {result && (
        <div className="result-box">
          <h3>{result.success ? '✅ 성공' : '❌ 실패'}</h3>
          <pre>{JSON.stringify(result.success ? result.data : result.error, null, 2)}</pre>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#d1ecf1', 
        borderRadius: '8px',
        border: '1px solid #bee5eb'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#0c5460' }}>💡 사용 방법</h3>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: '#0c5460' }}>
          <li>결제 정보와 출금 계좌 정보를 입력합니다.</li>
          <li>"계좌이체 결제" 버튼을 클릭하여 이체를 요청합니다.</li>
          <li>시스템이 계좌에서 금액을 출금하여 결제를 처리합니다.</li>
          <li>실시간으로 결제 완료 여부를 확인할 수 있습니다.</li>
          <li>"이체 상태 조회"로 이체 결과를 다시 확인할 수 있습니다.</li>
        </ol>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <strong>⚠️ 보안 안내:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>계좌 비밀번호는 암호화되어 전송됩니다.</li>
            <li>결제 정보는 안전하게 보호됩니다.</li>
            <li>의심스러운 거래는 즉시 차단됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AccountTransfer;
