import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthCheck } from '../services/api';

function Home() {
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await healthCheck();
      if (response.data.status === 'ok') {
        setServerStatus('online');
      }
    } catch (error) {
      setServerStatus('offline');
    }
  };

  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title" style={{ justifyContent: 'center', fontSize: '2.5rem' }}>
          💳 KG모빌리언스 결제 클라이언트
        </h1>
        <p className="page-description">
          다양한 결제 수단을 지원하는 통합 결제 솔루션
        </p>
        
        <div style={{ marginTop: '1rem' }}>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            backgroundColor: serverStatus === 'online' ? '#d4edda' : serverStatus === 'offline' ? '#f8d7da' : '#e2e3e5',
            color: serverStatus === 'online' ? '#155724' : serverStatus === 'offline' ? '#721c24' : '#383d41'
          }}>
            {serverStatus === 'online' && '🟢 서버 연결됨'}
            {serverStatus === 'offline' && '🔴 서버 오프라인'}
            {serverStatus === 'checking' && '🟡 서버 확인 중...'}
          </span>
        </div>
      </div>

      <div className="card-grid">
        <Link to="/card" style={{ textDecoration: 'none' }}>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>카드결제</h3>
            <p>신용카드/체크카드로 즉시 결제할 수 있습니다. 일시불 및 할부 결제를 지원합니다.</p>
          </div>
        </Link>

        <Link to="/billing" style={{ textDecoration: 'none' }}>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>자동결제</h3>
            <p>빌링키를 발급받아 정기결제를 자동으로 처리할 수 있습니다.</p>
          </div>
        </Link>

        <Link to="/link" style={{ textDecoration: 'none' }}>
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>URL결제</h3>
            <p>결제 링크를 생성하여 고객에게 전송하고 간편하게 결제받을 수 있습니다.</p>
          </div>
        </Link>

        <Link to="/vaccount" style={{ textDecoration: 'none' }}>
          <div className="feature-card">
            <div className="feature-icon">🏦</div>
            <h3>가상계좌</h3>
            <p>가상계좌를 발급하여 은행 이체로 결제할 수 있습니다.</p>
          </div>
        </Link>

        <Link to="/account" style={{ textDecoration: 'none' }}>
          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <h3>계좌이체</h3>
            <p>고객의 계좌에서 직접 이체하여 실시간으로 결제할 수 있습니다.</p>
          </div>
        </Link>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>🚀 주요 특징</h2>
        <ul style={{ lineHeight: '2', color: '#666', paddingLeft: '1.5rem' }}>
          <li>✅ 5가지 결제 수단 지원 (카드, 자동결제, URL, 가상계좌, 계좌이체)</li>
          <li>✅ 실시간 결제 상태 조회</li>
          <li>✅ 결제 취소 및 환불 처리</li>
          <li>✅ 17개 은행 지원</li>
          <li>✅ SHA256 보안 암호화</li>
          <li>✅ 반응형 디자인으로 모바일 지원</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
