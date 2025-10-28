import { useState } from 'react';
import { cardPaymentAPI } from '../services/api';

function CardPayment() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    orderId: 'ORD' + Date.now(),
    amount: '1000',
    productName: '테스트 상품',
    buyerName: '서준호',
    buyerEmail: 'slslcx@daum.net',
    buyerTel: '01082556595',
    returnUrl: 'https://d98f9219293d.ngrok-free.app/payment/result',
    cancelUrl: 'https://d98f9219293d.ngrok-free.app/payment/cancel'
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
      const response = await cardPaymentAPI.pay(formData);
      
      if (response.data.success && (response.data.paymentUrl || response.data.pay_url)) {
        // KG모빌리언스 결제창을 새창에서 열기
        const paymentUrl = response.data.paymentUrl || response.data.pay_url;
        const paymentWindow = window.open(
          paymentUrl,
          'payment',
          'width=800,height=600,scrollbars=yes,resizable=yes,top=100,left=100'
        );
        
        // 팝업이 차단되었는지 확인
        if (!paymentWindow || paymentWindow.closed || typeof paymentWindow.closed === 'undefined') {
          setResult({ 
            success: false, 
            error: '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.',
            paymentUrl: paymentUrl
          });
          return;
        }
        
        // 결제창이 닫혔는지 확인하는 함수
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            setLoading(false);
            // 결제창이 닫혔을 때 상태 조회
            handleCheckStatus();
          }
        }, 1000);
        
        setResult({ 
          success: true, 
          message: 'KG모빌리언스 결제창이 새창에서 열렸습니다. 결제를 완료해주세요.',
          paymentUrl: paymentUrl
        });
        
      } else {
        setResult({ 
          success: false, 
          error: response.data.error || '결제창 생성에 실패했습니다.' 
        });
      }
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
      const response = await cardPaymentAPI.getStatus(formData.orderId);
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
    setFormData(prev => ({ ...prev, orderId: 'ORD' + Date.now() }));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">💳 카드결제</h1>
      <p className="page-description">
        KG모빌리언스 결제창을 통해 안전하게 결제할 수 있습니다. 카드 정보는 KG모빌리언스에서 안전하게 처리됩니다.
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
          <label>결제 완료 후 이동할 URL</label>
          <input
            type="url"
            name="returnUrl"
            value={formData.returnUrl}
            onChange={handleChange}
            placeholder="https://yoursite.com/payment/result"
            required
          />
          <small>결제 완료 후 사용자가 돌아올 URL</small>
        </div>

        <div className="form-group">
          <label>결제 취소 시 이동할 URL</label>
          <input
            type="url"
            name="cancelUrl"
            value={formData.cancelUrl}
            onChange={handleChange}
            placeholder="https://yoursite.com/payment/cancel"
            required
          />
          <small>결제 취소 시 사용자가 돌아올 URL</small>
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
                결제창 생성중...
              </>
            ) : (
              <>💳 결제창 열기</>
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
          {result.success && result.message && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#2d5a2d' }}>{result.message}</p>
              {result.paymentUrl && (
                <button 
                  onClick={() => window.open(result.paymentUrl, 'payment', 'width=800,height=600,scrollbars=yes,resizable=yes')}
                  className="btn btn-primary"
                  style={{ marginTop: '0.5rem' }}
                >
                  🔗 결제창 다시 열기
                </button>
              )}
            </div>
          )}
          <pre>{JSON.stringify(result.success ? result : result.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default CardPayment;
