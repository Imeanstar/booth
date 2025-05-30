import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import ChartPage from './ChartPage';
import MarketPage from './MarketPage';
import Login from './Login';
import PurchaseResponse from './PurchaseResponsePage.js';
import AdminPage from './AdminPage.js';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const userRole = localStorage.getItem('userRole');

  return (
    <Router>
      <div>
        {/* 로그인 상태에 따라 다르게 표시되는 네비게이션 */}
        {isLoggedIn 
          ? userRole === 'admin' 
            ? (
              <nav>

              </nav>
              ) 
        
          : (
            <nav>
              <div class="pb-3">
                <div class="flex border-b border-[#d1e6d9] px-4 gap-8"><Link to="/chart">
                  <a class="flex flex-col items-center justify-center border-b-[3px] border-b-[#39e079] text-[#0e1a13] pb-[13px] pt-4" href="#">
                    <p class="text-[#0e1a13] text-sm font-bold leading-normal tracking-[0.015em]">Chart</p>
                  </a></Link><Link to="/market">
                  <a class="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#51946b] pb-[13px] pt-4" href="#">
                    <p class="text-[#51946b] text-sm font-bold leading-normal tracking-[0.015em]">Market</p>
                  </a></Link>
                </div>
              </div>
            </nav>
          ) 
        : <div></div>}

        <Routes>
          {/* 로그인 페이지가 첫 화면에 나오도록 설정 */}
          <Route 
            path="/" 
            element={
              isLoggedIn 
              ? userRole === 'admin' 
                ? <Navigate to ="/admin" /> 
                : <Navigate to="/chart" /> 
              : <Login setIsLoggedIn={setIsLoggedIn} />
            } 
          />
          <Route path="/chart" element={isLoggedIn ? <ChartPage /> : <Navigate to="/" />} />
          <Route path="/market" element={isLoggedIn ? <MarketPage /> : <Navigate to="/" />} />
          <Route path="/purchase-response" element={<PurchaseResponse />} />
          <Route path="/admin" element={isLoggedIn && userRole === 'admin' ? <AdminPage /> : <Navigate to = "/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


/*
[노션 질문]
1. firebaseConfig 내용을 내 firebase를 따로 만들어서 그걸로 바꿔야되는건지 (웹코드 부분)
2. (스프레드시트->db연동 부분) syncSheetToFirestore.js를 따로 만들어야되는건지, 아니면 어디 따로 입력하는 부분이 있는건지

[별개 질문]
3. 따로 포크떠와서 하고있는데 그래서 안되는건가? 그냥 클론만 떠와서 해볼까?
4. 일단 firebase를 해결해야 뭐라도 만지긴 할듯,, 따로 설치해서 뭘 해야되는지... 
아니면 뭐 코드만 몇 자 바꾸면 있는 firebase접근해서 할 수 있는지 그런거 좀 알려주세요,, 




1. 자기 firebase 프로젝트 만들어서 firestore database 열고 설정가서 내리면 firebaseconfig 있는데 복붙하면됨.
2. 스프레드시트에서 앱스크립트를 들어가서 syncSheetToFirestore.js 생성후 만들어야함 
그리고 코드에서 firebase db경로 수정, 보안규칙 노션에 올려놓은거 복붙.

3. 클론하고 언급해둔부분만 바꾸면 사용가능할듯함(아마)
4.위에거 하면될듯함
*/