import { useState } from 'react';
import { linkPaymentAPI } from '../services/api';

function LinkPayment() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    orderId: 'LINK' + Date.now(),
    amount: '10000',
    productName: 'URL 결제 상품',
    buyerName: '홍길동',
    buyerEmail: 'test@example.com',
    buyerTel: '01012345678',
    returnUrl: window.location.origin + '/payment/result',
    cancelUrl: window.location.origin + '/payment/cancel'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await linkPaymentAPI.create(formData);
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
      const response = await linkPaymentAPI.getStatus(formData.orderId);
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
    setFormData(prev => ({ ...prev, orderId: 'LINK' + Date.now() }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🔗 URL 결제</h1>
      <p className="page-description">
        결제 링크를 생성하여 고객에게 전송하고 간편하게 결제받을 수 있습니다.
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

        <div className="form-group">
          <label>결제 완료 URL</label>
          <input
            type="url"
            name="returnUrl"
            value={formData.returnUrl}
            onChange={handleChange}
            required
          />
          <small>결제 완료 후 고객이 이동할 URL</small>
        </div>

        <div className="form-group">
          <label>결제 취소 URL</label>
          <input
            type="url"
            name="cancelUrl"
            value={formData.cancelUrl}
            onChange={handleChange}
          />
          <small>결제 취소 시 고객이 이동할 URL (선택사항)</small>
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
              <>🔗 결제 링크 생성</>
            )}
          </button>

          <button 
            type="button"
            onClick={handleCheckStatus}
            className="btn btn-secondary"
            disabled={loading}
          >
            📊 결제 상태 조회
          </button>
        </div>
      </form>

      {result && (
        <div className="result-box">
          <h3>{result.success ? '✅ 성공' : '❌ 실패'}</h3>
          
          {result.success && result.data?.data?.paymentUrl && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: '#d4edda', 
              borderRadius: '8px',
              border: '1px solid #c3e6cb'
            }}>
              <strong style={{ color: '#155724' }}>🎉 결제 링크가 생성되었습니다!</strong>
              <div style={{ marginTop: '0.5rem' }}>
                <a 
                  href={result.data.data.paymentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#155724', 
                    textDecoration: 'underline',
                    wordBreak: 'break-all'
                  }}
                >
                  {result.data.data.paymentUrl}
                </a>
              </div>
            </div>
          )}
          
          <pre>{JSON.stringify(result.success ? result.data : result.error, null, 2)}</pre>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '8px',
        border: '1px solid #bee5eb'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#004085' }}>💡 사용 방법</h3>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: '#004085' }}>
          <li>결제 정보를 입력하고 "결제 링크 생성" 버튼을 클릭합니다.</li>
          <li>생성된 결제 링크를 고객에게 카카오톡, 문자, 이메일 등으로 전송합니다.</li>
          <li>고객이 링크를 클릭하면 결제 페이지로 이동합니다.</li>
          <li>고객이 결제를 완료하면 설정한 Return URL로 이동합니다.</li>
          <li>"결제 상태 조회"로 결제 완료 여부를 확인할 수 있습니다.</li>
        </ol>
      </div>
    </div>
  );
}

export default LinkPayment;
