import { useState } from 'react';
import { cardPaymentAPI } from '../services/api';

function CardPayment() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    orderId: 'ORD' + Date.now(),
    amount: '10000',
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
        신용카드 또는 체크카드로 즉시 결제할 수 있습니다.
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
          <label>카드번호</label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="1234567812345678"
            maxLength="16"
            required
          />
          <small>16자리 숫자 (하이픈 없이)</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>유효기간</label>
            <input
              type="text"
              name="cardExpiry"
              value={formData.cardExpiry}
              onChange={handleChange}
              placeholder="2512"
              maxLength="4"
              required
            />
            <small>YYMM 형식 (예: 2512)</small>
          </div>

          <div className="form-group">
            <label>비밀번호 앞 2자리</label>
            <input
              type="password"
              name="cardPassword"
              value={formData.cardPassword}
              onChange={handleChange}
              maxLength="2"
              required
            />
          </div>

          <div className="form-group">
            <label>생년월일 / 사업자번호</label>
            <input
              type="text"
              name="cardIdNumber"
              value={formData.cardIdNumber}
              onChange={handleChange}
              placeholder="900101"
              maxLength="10"
              required
            />
            <small>생년월일 6자리 또는 사업자번호 10자리</small>
          </div>

          <div className="form-group">
            <label>할부개월</label>
            <select
              name="installment"
              value={formData.installment}
              onChange={handleChange}
              required
            >
              <option value="00">일시불</option>
              <option value="02">2개월</option>
              <option value="03">3개월</option>
              <option value="04">4개월</option>
              <option value="05">5개월</option>
              <option value="06">6개월</option>
              <option value="07">7개월</option>
              <option value="08">8개월</option>
              <option value="09">9개월</option>
              <option value="10">10개월</option>
              <option value="11">11개월</option>
              <option value="12">12개월</option>
            </select>
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
              <>💳 결제하기</>
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
          <pre>{JSON.stringify(result.success ? result.data : result.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default CardPayment;
