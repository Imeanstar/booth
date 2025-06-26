import React, { useState } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// ID : admin@example.com
// PW : p@22w0rd

// ID : user1@example.com
// PW : 123456

const Login = ({ setIsLoggedIn }) => {
  // 이메일 입력값과 에러 메시지 상태
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 로그인 처리 함수
  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      // Firestore에서 해당 이메일을 가진 사용자 검색
      const q = query(collection(db, 'members'), where('email', '==', trimmedEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('이메일이 존재하지 않습니다.');
      } else {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // 이메일 로컬 스토리지에 저장 (사용자 식별용)
        localStorage.setItem('userEmail', trimmedEmail);
        localStorage.setItem('userRole', userData.role || 'user');

        setError('');
        setIsLoggedIn(true); // 로그인 상태 true로 설정

        if (userData.role === 'admin'){
          navigate('/admin');
        }
        else{
          navigate('/market');
        }
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h1>로그인</h1>

      {/* 이메일 입력 필드 */}
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="이메일을 입력하세요" 
      />

      {/* 로그인 버튼 */}
      <button onClick={handleLogin}>로그인</button>

      {/* 에러 메시지 표시 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
