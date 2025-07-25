// TODOLIST
// 최종 ✨ 으로 🎉 해야 하는 것 🧨 -> 설치한 패키지 잘 연계시키기
//    존나 많이 설치했다는 점 잊지말기
// 다크모드일 때 뭔가 색 적용이 이상한듯함. 수정 필요 -> 일단 ㅌ테스트용 수정 해놨는데, 확인 후에 전체 수정 필요.




// 각 페이지 modal창 (완료[수정 필요할수도 있음])
// 이미지 넣고, 파비콘 바꾸고 하기(완료)
// 코인 가격 chart(완료)
// nav bar animation 및 색상 변환 작업(완료)
// 구글폼 연동 기능 (완료)
// 구글폼 적으면 자동으로 코인 들어가게 할까? (완료 - 수치 조정 필요시, Apps Script[시크릿탭] 에서 수치 조절하기)

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ChartPage from './ChartPage';
import MarketPage from './MarketPage';
import Login from './Login';
import PurchaseResponse from './PurchaseResponsePage.js';
import AdminPage from './AdminPage.js';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const userRole = localStorage.getItem('userRole');

  return (
      <div>

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