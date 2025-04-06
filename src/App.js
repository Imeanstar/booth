import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import ChartPage from './ChartPage';
import MarketPage from './MarketPage';
import Login from './Login';
import PurchaseResponse from './PurchaseResponsePage.js';
import AdminPage from './AdminPage.js';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

  return (
    <Router>
      <div>
        {/* 로그인 상태에 따라 다르게 표시되는 네비게이션 */}
        {isLoggedIn && (
          <nav>
            <ul style={{ display: 'flex', justifyContent: 'space-around' }}>
              <li><Link to="/chart">실시간 차트</Link></li>
              <li><Link to="/market">마켓</Link></li>
            </ul>
          </nav>
        )}

        <Routes>
          {/* 로그인 페이지가 첫 화면에 나오도록 설정 */}
          <Route path="/" element={isLoggedIn ? <Navigate to="/chart" /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/chart" element={isLoggedIn ? <ChartPage /> : <Navigate to="/" />} />
          <Route path="/market" element={isLoggedIn ? <MarketPage /> : <Navigate to="/" />} />
          <Route path="/purchase-response" element={<PurchaseResponse />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
