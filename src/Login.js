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
      <div className='h-[189px] w-10'></div>
      <div className='place-items-center'>
        <div className='flex w-[330px]'>
          <img src="/symbol.png" alt='symbol' className='flex w-[55px] h-[55px]'></img>
        </div>
        
      </div>
      
      <div className='place-items-center w-full h-4'>
        <p className='flex text-[13px] w-[333px]'>로그인하려면 인증 정보를 입력해주세요</p>
      </div>
      <div className='w-full h-[12.38px] mt-[62px] place-items-center mb-3'>
        <p className='flex text-[12px] text-gray-400 w-[333px]'>아이디 ex) ajouinvest@ajou.ac.kr</p>
      </div>
      
      
      {/* 이메일 입력 필드 */}
      <div className='place-items-center h-9'>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="아이디" 
          className='flex rounded-lg mt-[6.81px] w-[333px] h-9 text-[12px] placeholder:text-gray-400'
        />
      </div>
      {/* 로그인 버튼 */}
      <div className='w-full place-items-center mt-[9.81px]'>
        <button 
          onClick={handleLogin}
          className='flex w-[333px] h-9 rounded-lg bg-gradient-to-r from-[#7b88bf] to-[#2d4a8f] items-center justify-center text-white '
        >
          시작하기
        </button>
      </div>

      <div className='place-items-center mt-[7px]'>
        <div className='flex w-[333px]'>
          <img src='/symbol.png' alt='id_save' className='h-[17px] w-[17px]'></img>
          <p className='text-[12px] text-gray-600'>아이디 저장</p>
        </div>
      </div>
      
      <div className='place-items-center'>
        <div className='flex bg-[#d9d9d9] w-[333px] h-[0.5px] mt-8'></div>
      </div>
      
      <div className='place-items-center'>
        <div className='flex bg-[#2c4a8f] w-[333px] h-[38px] rounded-lg mt-5'></div>
      </div>

      {/* 에러 메시지 표시 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
