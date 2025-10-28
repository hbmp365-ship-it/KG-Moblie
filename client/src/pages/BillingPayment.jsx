import { useState } from 'react';
import { billingAPI } from '../services/api';

function BillingPayment() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [billingKey, setBillingKey] = useState('');
  const [tab, setTab] = useState('register'); // register, pay, delete

  const [registerData, setRegisterData] = useState({
    orderId: 'BILL' + Date.now(),
    amount: '1000',
    productName: '빌링키 발급 테스트',
    buyerName: '서준호',
    buyerEmail: 'slslcx@daum.net',
    buyerTel: '01082556595',
    returnUrl: 'https://d98f9219293d.ngrok-free.app/payment/result',
    cancelUrl: 'https://d98f9219293d.ngrok-free.app/payment/cancel'
  });

  const [paymentData, setPaymentData] = useState({
    billingKey: '',
    orderId: 'AUTO' + Date.now(),
    amount: '1000',
    productName: '정기결제 상품',
    buyerName: '홍길동',
    buyerEmail: 'test@example.com'
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await billingAPI.requestKey(registerData);
      
      if (response.data.success && (response.data.paymentUrl || response.data.pay_url)) {
        // KG모빌리언스 빌링키 발급 결제창을 새창에서 열기
        const paymentUrl = response.data.paymentUrl || response.data.pay_url;
        const paymentWindow = window.open(
          paymentUrl,
          'billing',
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
          message: 'KG모빌리언스 빌링키 발급 결제창이 새창에서 열렸습니다. 카드 정보를 입력하여 빌링키를 발급받아주세요.',
          paymentUrl: paymentUrl
        });
        
      } else {
        setResult({ 
          success: false, 
          error: response.data.error || '빌링키 발급 결제창 생성에 실패했습니다.' 
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

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await billingAPI.pay(paymentData);
      
      if (response.data.success && (response.data.paymentUrl || response.data.pay_url)) {
        // KG모빌리언스 빌링키 결제창을 새창에서 열기
        const paymentUrl = response.data.paymentUrl || response.data.pay_url;
        const paymentWindow = window.open(
          paymentUrl,
          'billing-pay',
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
          message: 'KG모빌리언스 빌링키 결제창이 새창에서 열렸습니다. 빌링키로 결제를 진행해주세요.',
          paymentUrl: paymentUrl
        });
        
      } else {
        setResult({ 
          success: false, 
          error: response.data.error || '빌링키 결제창 생성에 실패했습니다.' 
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

  const handleCheckStatus = () => {
    // 결제창이 닫힌 후 상태 확인 (필요시 구현)
    console.log('결제창이 닫혔습니다. 상태를 확인합니다.');
  };

  const handleDelete = async () => {
    if (!billingKey) {
      setResult({ success: false, error: '빌링키를 입력하세요.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await billingAPI.deleteKey(billingKey);
      setResult({ success: true, data: response.data });
      setBillingKey('');
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.response?.data || error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🔄 자동결제 (빌링)</h1>
      <p className="page-description">
        빌링키를 발급받아 정기결제를 자동으로 처리할 수 있습니다.
      </p>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setTab('register')}
          className={`btn ${tab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📝 빌링키 발급
        </button>
        <button
          onClick={() => setTab('pay')}
          className={`btn ${tab === 'pay' ? 'btn-primary' : 'btn-secondary'}`}
        >
          💳 빌링 결제
        </button>
        <button
          onClick={() => setTab('delete')}
          className={`btn ${tab === 'delete' ? 'btn-primary' : 'btn-secondary'}`}
        >
          🗑️ 빌링키 삭제
        </button>
      </div>

      {tab === 'register' && (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>주문번호</label>
            <input
              type="text"
              name="orderId"
              value={registerData.orderId}
              onChange={handleRegisterChange}
              required
            />
          </div>

          <div className="form-group">
            <label>결제금액</label>
            <input
              type="number"
              name="amount"
              value={registerData.amount}
              onChange={handleRegisterChange}
              required
            />
          </div>

          <div className="form-group">
            <label>상품명</label>
            <input
              type="text"
              name="productName"
              value={registerData.productName}
              onChange={handleRegisterChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>구매자명</label>
              <input
                type="text"
                name="buyerName"
                value={registerData.buyerName}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                name="buyerEmail"
                value={registerData.buyerEmail}
                onChange={handleRegisterChange}
                required
              />
            </div>

            <div className="form-group">
              <label>전화번호</label>
              <input
                type="tel"
                name="buyerTel"
                value={registerData.buyerTel}
                onChange={handleRegisterChange}
                required
              />
            </div>
          </div>

          <div className="info-box" style={{ 
            background: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>💡 빌링키 발급 안내</h4>
            <p style={{ margin: '0', color: '#1976d2' }}>
              빌링키 발급을 위해 카드 정보는 KG모빌리언스 결제창에서 안전하게 입력하시면 됩니다.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '처리중...' : '📝 빌링키 발급'}
          </button>
        </form>
      )}

      {tab === 'pay' && (
        <form onSubmit={handlePayment}>
          <div className="form-group">
            <label>빌링키</label>
            <input
              type="text"
              name="billingKey"
              value={paymentData.billingKey}
              onChange={handlePaymentChange}
              placeholder="발급받은 빌링키를 입력하세요"
              required
            />
            {billingKey && (
              <small style={{ color: '#28a745' }}>
                ✓ 저장된 빌링키: {billingKey}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>주문번호</label>
            <input
              type="text"
              name="orderId"
              value={paymentData.orderId}
              onChange={handlePaymentChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>결제금액</label>
              <input
                type="number"
                name="amount"
                value={paymentData.amount}
                onChange={handlePaymentChange}
                required
              />
            </div>

            <div className="form-group">
              <label>상품명</label>
              <input
                type="text"
                name="productName"
                value={paymentData.productName}
                onChange={handlePaymentChange}
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
                value={paymentData.buyerName}
                onChange={handlePaymentChange}
                required
              />
            </div>

            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                name="buyerEmail"
                value={paymentData.buyerEmail}
                onChange={handlePaymentChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '처리중...' : '💳 결제하기'}
          </button>
        </form>
      )}

      {tab === 'delete' && (
        <div>
          <div className="form-group">
            <label>빌링키</label>
            <input
              type="text"
              value={billingKey}
              onChange={(e) => setBillingKey(e.target.value)}
              placeholder="삭제할 빌링키를 입력하세요"
            />
          </div>

          <button 
            onClick={handleDelete} 
            className="btn btn-danger" 
            disabled={loading}
          >
            {loading ? '처리중...' : '🗑️ 빌링키 삭제'}
          </button>
        </div>
      )}

      {result && (
        <div className="result-box">
          <h3>{result.success ? '✅ 성공' : '❌ 실패'}</h3>
          <pre>{JSON.stringify(result.success ? result.data : result.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default BillingPayment;
