import { useState } from 'react';
import { billingAPI } from '../services/api';

function BillingPayment() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [billingKey, setBillingKey] = useState('');
  const [tab, setTab] = useState('register'); // register, pay, delete

  const [registerData, setRegisterData] = useState({
    orderId: 'BILL' + Date.now(),
    cardNumber: '1234567812345678',
    cardExpiry: '2512',
    cardPassword: '12',
    cardIdNumber: '900101',
    buyerName: '홍길동',
    buyerEmail: 'test@example.com',
    buyerTel: '01012345678'
  });

  const [paymentData, setPaymentData] = useState({
    billingKey: '',
    orderId: 'AUTO' + Date.now(),
    amount: '10000',
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
      setResult({ success: true, data: response.data });
      
      // 빌링키가 발급되면 자동으로 저장
      if (response.data.data?.billingKey) {
        setBillingKey(response.data.data.billingKey);
        setPaymentData(prev => ({ ...prev, billingKey: response.data.data.billingKey }));
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
            <label>카드번호</label>
            <input
              type="text"
              name="cardNumber"
              value={registerData.cardNumber}
              onChange={handleRegisterChange}
              placeholder="1234567812345678"
              maxLength="16"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>유효기간</label>
              <input
                type="text"
                name="cardExpiry"
                value={registerData.cardExpiry}
                onChange={handleRegisterChange}
                placeholder="2512"
                maxLength="4"
                required
              />
              <small>YYMM 형식</small>
            </div>

            <div className="form-group">
              <label>비밀번호 앞 2자리</label>
              <input
                type="password"
                name="cardPassword"
                value={registerData.cardPassword}
                onChange={handleRegisterChange}
                maxLength="2"
                required
              />
            </div>

            <div className="form-group">
              <label>생년월일 / 사업자번호</label>
              <input
                type="text"
                name="cardIdNumber"
                value={registerData.cardIdNumber}
                onChange={handleRegisterChange}
                placeholder="900101"
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
