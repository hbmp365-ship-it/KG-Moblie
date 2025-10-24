import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CardPayment from './pages/CardPayment';
import BillingPayment from './pages/BillingPayment';
import LinkPayment from './pages/LinkPayment';
import VirtualAccount from './pages/VirtualAccount';
import AccountTransfer from './pages/AccountTransfer';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <h1>💳 KG모빌리언스 결제 클라이언트</h1>
            <nav className="main-nav">
              <Link to="/" className="nav-link">홈</Link>
              <Link to="/card" className="nav-link">카드결제</Link>
              <Link to="/billing" className="nav-link">자동결제</Link>
              <Link to="/link" className="nav-link">URL결제</Link>
              <Link to="/vaccount" className="nav-link">가상계좌</Link>
              <Link to="/account" className="nav-link">계좌이체</Link>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/card" element={<CardPayment />} />
              <Route path="/billing" element={<BillingPayment />} />
              <Route path="/link" element={<LinkPayment />} />
              <Route path="/vaccount" element={<VirtualAccount />} />
              <Route path="/account" element={<AccountTransfer />} />
            </Routes>
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>© 2024 KG모빌리언스 결제 시스템 - React Client</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
