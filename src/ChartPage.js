import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection, onSnapshot, doc, updateDoc, getDocs, query, where, addDoc, serverTimestamp
} from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

// Chart.js 구성 요소 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ChartPage = () => {
  // 상태 선언
  const [priceData, setPriceData] = useState([]);
  const [userCoin, setUserCoin] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [userDocId, setUserDocId] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(null);

  const userEmail = localStorage.getItem('userEmail'); // 로컬 스토리지에서 이메일 불러오기

  useEffect(() => {
    // 코인 가격 히스토리 실시간 구독
    const unsubscribePriceHistory = onSnapshot(collection(db, 'coinPriceHistory'), (snapshot) => {
      const prices = snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));
      prices.sort((a, b) => a.timestamp - b.timestamp);
      setPriceData(prices);
      setLoading(false);
    });

    // 현재 가격 실시간 구독
    const unsubscribeCurrentPrice = onSnapshot(doc(db, 'coin', 'currentPrice'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setCurrentPrice(docSnapshot.data().price);
      }
    });

    // 사용자 정보 불러오기
    const fetchUserData = async () => {
      try {
        const q = query(collection(db, 'members'), where('email', '==', userEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setUserDocId(doc.id);
          const { coins = 0, balance = 0 } = doc.data();
          setUserCoin(coins);
          setUserBalance(balance);
        } else {
          console.error('해당 이메일 사용자를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('사용자 정보 불러오기 실패:', err);
      }
    };

    fetchUserData();

    // 언마운트 시 구독 해제
    return () => {
      unsubscribePriceHistory();
      unsubscribeCurrentPrice();
    };
  }, [userEmail]);

  // 매도 처리 함수
  const handleSell = async () => {
    if (!userDocId || currentPrice === null) return;

    const amountToSell = Number(sellAmount);
    if (!amountToSell || amountToSell <= 0) {
      alert('올바른 매도 수량을 입력해주세요.');
      return;
    }

    if (amountToSell > userCoin) {
      alert('보유 코인보다 많이 팔 수 없습니다.');
      return;
    }

    const earned = currentPrice * amountToSell;

    try {
      // 사용자 자산 업데이트
      const userRef = doc(db, 'members', userDocId);
      await updateDoc(userRef, {
        coins: userCoin - amountToSell,
        balance: userBalance + earned
      });

      // 매도 로그 기록
      await addDoc(collection(db, 'sellLogs'), {
        email: userEmail,
        amount: amountToSell,
        pricePerCoin: currentPrice,
        totalEarned: earned,
        timestamp: serverTimestamp()
      });

      // 상태 업데이트
      setUserCoin(prev => prev - amountToSell);
      setUserBalance(prev => prev + earned);
      setSellAmount('');
      alert(`${amountToSell}개 매도 완료! ${earned}원 획득.`);
    } catch (err) {
      console.error('매도 실패:', err);
      alert('매도 중 오류가 발생했습니다.');
    }
  };

  // 차트 데이터 구성
  const chartData = {
    labels: priceData.map(p => p.timestamp.toLocaleString()),
    datasets: [
      {
        label: '증연 코인 시세',
        data: priceData.map(p => p.price),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      }
    ]
  };

  return (
    <div>
      <h2>실시간 증연코인 시세</h2>
      {loading ? <div>Loading...</div> : <Line data={chartData} />}

      {currentPrice !== null && (
        <h3>현재 가격: {currentPrice.toLocaleString()} 원</h3>
      )}

      <div style={{ marginTop: '20px' }}>
        <p>보유 코인: {userCoin} 개</p>
        <p>보유 금액: {userBalance.toLocaleString()} 원</p>

        {/* 매도 입력 및 버튼 */}
        <input
          type="number"
          placeholder="매도 수량"
          value={sellAmount}
          onChange={(e) => setSellAmount(e.target.value)}
          min={1}
          max={userCoin}
          style={{ marginRight: '10px', width: '150px' }}
        />
        <button onClick={handleSell} disabled={!sellAmount || userCoin <= 0}>
          매도하기
        </button>

        {/* 예상 수익 표시 */}
        {sellAmount > 0 && currentPrice && (
          <p style={{ marginTop: '10px' }}>
            예상 수익: {(currentPrice * Number(sellAmount)).toLocaleString()} 원
          </p>
        )}
      </div>
    </div>
  );
};

export default ChartPage;
