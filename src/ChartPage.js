import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection, onSnapshot, doc, updateDoc, getDocs, query, where, addDoc, serverTimestamp
} from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import CoinSellModal from "./components/CoinSellModal";

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
  const confirmSell = async (amountToSell) => {
    if (!userDocId || currentPrice === null || amountToSell <= 0) return;

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
      // alert(`${amountToSell}개 매도 완료! ${earned}원 획득.`);
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
        borderColor: 'rgba(24,140,76,1)',
        tension: 0.1,
      }
    ]
  };

  const formatChangeDisplay = (value) => {
    if (value > 0) {
      return <span className="text-red-500">▲ {value}</span>;
    } else if (value < 0) {
      return <span className="text-blue-500">▼ {Math.abs(value)}</span>;
    } else {
      return <span className="text-gray-500">0</span>;
    }
  };

  // 상승률 계산 함수 (퍼센트 % 계산)
  const calculateChange = (basePrice, currentPrice) => {
    if (!basePrice || !currentPrice) return 0;
    const diff = currentPrice - basePrice;
    return diff;
    // return ((diff / basePrice) * 100).toFixed(2); // 소수점 둘째 자리
  };

  const firstPrice = priceData.length > 0 ? priceData[0].price : null; // 오늘 처음 가격
  const lastPrice = priceData.length > 1 ? priceData[priceData.length - 2].price : null; // 최근 직전 가격
  const todayChange = calculateChange(firstPrice, currentPrice);
  const recentChange = calculateChange(lastPrice, currentPrice);

  const chartOption = {
    plugins:{
      legend:{
        display : false
      }
    },
    scales: {
      x: {
        ticks: {
          display : false
        },
        grid: {
          display : false
        }
      },
      y: {
        ticks: {
          color : '#0e1a13',
        },
        grid: {
          color: '#e8f2ec',
        }
      }
    }
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbfa] justify-between group/design-root overflow-x-hidden">
      <div>
        <div className="flex flex-wrap gap-4 px-4 py-6">
          <div className="flex min-w-72 flex-1 flex-col gap-2">
            <p className="text-[#0e1a13] text-base font-medium leading-normal">실시간 증연코인 시세</p>
            <p className="text-[#0e1a13] tracking-light text-[32px] font-bold leading-tight truncate">
              {currentPrice !== null && (
                <h3>현재 가격: {currentPrice.toLocaleString()} 원</h3>
              )}
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-[#0e1a13] text-base font-semibold leading-normal">
                Today {formatChangeDisplay(todayChange)} ￦
              </p>
              <p className="text-[#0e1a13] text-base font-semibold leading-normal">
                Recent {formatChangeDisplay(recentChange)} ￦
              </p>
            </div>
            {loading ? <div>Loading...</div> : <Line data={chartData} options={chartOption} />}

          </div>
        </div>
        <br/>
        <p className="text-[#0e1a13] text-base font-semibold leading-normal pb-0 pt-1 px-4">보유 코인: {userCoin.toLocaleString()} 개</p>
        <p className="text-[#0e1a13] text-base font-semibold leading-normal pb-0 pt-1 px-4">보유 금액: {userBalance.toLocaleString()} 원</p>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <input
              type="number"
              placeholder="매도 수량"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              min={1}
              max={userCoin}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e1a13] focus:outline-0 focus:ring-0 border-none bg-[#e8f2ec] focus:border-none h-14 placeholder:text-[#51946b] p-4 text-base font-normal leading-normal"
            />
          </label>
            <CoinSellModal
              amount={Number(sellAmount)}
              currentPrice={currentPrice}
              onConfirm={()=>confirmSell(Number(sellAmount))}
            />
        </div>
      </div>
    </div>

  );

};

export default ChartPage;
