import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL 파라미터에서 결제 결과 확인
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    const transactionId = searchParams.get('transactionId');

    if (orderId && status) {
      setResult({
        orderId,
        status,
        amount: amount ? parseInt(amount) : null,
        transactionId,
        timestamp: new Date().toISOString()
      });
    } else {
      setResult({
        error: '결제 결과 정보가 없습니다.',
        timestamp: new Date().toISOString()
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  const getStatusMessage = (status) => {
    switch (status) {
      case 'success':
      case 'paid':
        return { text: '결제가 완료되었습니다!', type: 'success' };
      case 'cancelled':
      case 'cancel':
        return { text: '결제가 취소되었습니다.', type: 'warning' };
      case 'failed':
      case 'fail':
        return { text: '결제에 실패했습니다.', type: 'error' };
      default:
        return { text: `결제 상태: ${status}`, type: 'info' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'paid':
        return '✅';
      case 'cancelled':
      case 'cancel':
        return '⚠️';
      case 'failed':
      case 'fail':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>결제 결과를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">💳 결제 결과</h1>
      
      {result && !result.error ? (
        <div className="result-container">
          <div className={`result-card ${getStatusMessage(result.status).type}`}>
            <div className="result-header">
              <span className="result-icon">
                {getStatusIcon(result.status)}
              </span>
              <h2 className="result-title">
                {getStatusMessage(result.status).text}
              </h2>
            </div>
            
            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">주문번호:</span>
                <span className="detail-value">{result.orderId}</span>
              </div>
              
              {result.transactionId && (
                <div className="detail-row">
                  <span className="detail-label">거래번호:</span>
                  <span className="detail-value">{result.transactionId}</span>
                </div>
              )}
              
              {result.amount && (
                <div className="detail-row">
                  <span className="detail-label">결제금액:</span>
                  <span className="detail-value">
                    {result.amount.toLocaleString()}원
                  </span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">처리시간:</span>
                <span className="detail-value">
                  {new Date(result.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="result-actions">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/'}
            >
              🏠 홈으로 돌아가기
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/card'}
            >
              💳 다시 결제하기
            </button>
          </div>
        </div>
      ) : (
        <div className="result-container">
          <div className="result-card error">
            <div className="result-header">
              <span className="result-icon">❌</span>
              <h2 className="result-title">결제 결과를 확인할 수 없습니다</h2>
            </div>
            
            <div className="result-details">
              <p className="error-message">
                {result?.error || '결제 정보가 올바르지 않습니다.'}
              </p>
            </div>
            
            <div className="result-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/'}
              >
                🏠 홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .result-container {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .result-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .result-card.success {
          border-left: 4px solid #10b981;
        }
        
        .result-card.warning {
          border-left: 4px solid #f59e0b;
        }
        
        .result-card.error {
          border-left: 4px solid #ef4444;
        }
        
        .result-card.info {
          border-left: 4px solid #3b82f6;
        }
        
        .result-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .result-icon {
          font-size: 2rem;
          margin-right: 1rem;
        }
        
        .result-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }
        
        .result-details {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1.5rem;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-weight: 600;
          color: #374151;
        }
        
        .detail-value {
          color: #6b7280;
          font-family: monospace;
        }
        
        .result-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .error-message {
          color: #ef4444;
          font-weight: 500;
          text-align: center;
          margin: 0;
        }
        
        .loading-container {
          text-align: center;
          padding: 3rem;
        }
        
        .loading-container .spinner {
          margin: 0 auto 1rem;
        }
      `}</style>
    </div>
  );
}

export default PaymentResult;
