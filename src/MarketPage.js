import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';
import MarketBuyModal from './components/MarketBuyModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode } from 'swiper/modules';
import { Link, useLocation } from 'react-router-dom';

const MarketPage = () => {
  const [items, setItems] = useState([]); // 마켓 아이템 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [userBalance, setUserBalance] = useState(0); // 사용자 잔액 상태
  const [userDocId, setUserDocId] = useState(null); // 사용자 문서 ID
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [purchaseSuccess, setPurchaseSuccess] = useState({ open: false, itemName: '' });

  const location = useLocation();
  const isChart = location.pathname === '/chart';
  const isMarket = location.pathname === '/market';


  const userEmail = localStorage.getItem('userEmail'); // 로컬 스토리지에서 사용자 이메일 가져오기

  useEffect(() => {
    // 실시간 마켓 아이템 구독
    const unsubscribeItems = onSnapshot(collection(db, 'marketItems'), (snapshot) => {
      const marketItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(marketItems); // 상태 업데이트
      setLoading(false); // 로딩 완료
    });

    // 사용자 balance 실시간 구독 설정
    const fetchUserInfo = async () => {
      const q = query(collection(db, 'members'), where('email', '==', userEmail));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        setUserDocId(docRef.id); // 사용자 문서 ID 저장

        // balance 실시간 반영
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserBalance(docSnap.data().balance || 0);
          }
        });
      } else {
        console.error('사용자 정보 없음');
      }
    };

    fetchUserInfo();

    // 컴포넌트 언마운트 시 마켓 구독 해제
    return () => unsubscribeItems();
  }, []);

  // 구매 요청 처리 함수
  const handleBuy = async (item) => {
    if (item.stock <= 0) {
      setErrorModal({ open: true, message: `${item.name}는 품절입니다.` });
      return;
    }

    if (userBalance < item.price) {
      console.log(1);
      setErrorModal({ open: true, message: '금액이 부족합니다.' });
      return;
    }

    const purchaseRequest = {
      userEmail,               // 구매자 이메일
      itemName: item.name,     // 물품 이름
      itemId: item.id,         // 물품 고유 ID
      quantity: 1,             // 수량 (고정)
      totalPrice: item.price,  // 총 가격
      status: 'pending',       // 처리 상태: 대기중
      timestamp: serverTimestamp(), // 요청 시간
    };

    try {
      // 구매 요청 Firestore에 추가
      await addDoc(collection(db, 'purchaseRequests'), purchaseRequest);

      // 사용자 잔액 차감
      if (userDocId) {
        const userDocRef = doc(db, 'members', userDocId);
        await updateDoc(userDocRef, {
          balance: userBalance - item.price,
        });
      }
      setPurchaseSuccess({ open: true, itemName: item.name });
    } catch (error) {
      console.error('구매 요청 실패:', error);
      setErrorModal({ open: true, message: '구매 요청 제출에 실패했습니다.' });
    }
  };

  return (
    <div className='bg-[#eaeaea]'>
      <div className='w-full h-[88px]'></div>
      <div className='place-items-center w-full'>
        <div className='flex flex-col jutify-center items-center w-[352px] h-[106px] bg-white rounded-3xl mb-[36px]'>
          <p class="flex mt-9 text-[14px] font-600">현재 보유 금액</p>
          <p class="flex mt-1 text-[14px] font-800 text-[#2e4c90]">{userBalance.toLocaleString()} 원</p>
        </div>
      </div>

      <div className='w-full'>
        <div className='place-items-center w-full'>
          <div className='flex place-items-center justify-center gap-6 items-center w-[209px] h-[36px]'>
            <Link
              to="/chart"
              className={`flex justify-center items-center w-[92px] h-[36px] rounded-full border text-sm font-semibold bg-white
              ${isChart ? 'text-blue-900 border-blue-500' : 'text-gray-400 border-gray-300'}`}
            >
              차트
            </Link>
            <Link
              to="/market"
              className={`flex justify-center items-center w-[92px] h-[36px] rounded-full border text-sm font-semibold bg-white
              ${isMarket ? 'text-blue-900 border-blue-500' : 'text-gray-400 border-gray-300'}`}
            >
              상점
            </Link>
          </div>
        </div>
      </div>

      <div className='w-full'>
        <div className='place-items-center w-full h-[364px] mt-[41px]'>
          <div className='w-full overflow-x-auto'>
            <Swiper
              modules={[FreeMode]}
              slidesPerView="auto"
              spaceBetween={16}
              freeMode={true}
              grabCursor={true}
              className="pl-4 pr-4"
            >
              {items.map(item => (
                <SwiperSlide key={item.id} className="!w-[188px] !h-[364px]">
                  <div className='bg-[#f9fbfa] p-4 rounded-xl shadow flex flex-col w-[188px] h-[364px]'>
                    <div className='w-[170px] h-[170px] mb-12'>
                      <img src={item.imageUrl} // Firestore에 저장한 이미지 URL
                        alt={item.name}
                        className=" object-contain mb-2">
                      </img>
                    </div>
                    <div className='flex flex-col justify-center'>
                      
                      <p className='text-[#101913] text-base font-medium leading-normal line-clamp-1'>
                        {item.name}
                      </p>
                      <p className='text-[#5a8c6d] text-sm font-normal leading-normal line-clamp-2'>
                        가격: {item.price.toLocaleString()} 원 | 수량: {item.stock} 개
                      </p>
                    </div>
                    <div className='shrink-0'>
                      {item.stock > 0 ? (
                        <MarketBuyModal item={item} onConfirm={handleBuy} />
                      ) : (
                        <button disabled className="text-xs text-gray-400">품절</button>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <div className='w-full'>
        <div className='place-items-center'>
          <div className='flex w-[349px] h-[55px] mt-[41px] bg-yellow-50'>

          </div>
        </div>
      </div>
       

      {/* 로딩 상태 또는 아이템 목록 표시
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h3>물품 목록</h3>
          <div>
            {items.length === 0 ? (
              <p>마켓에 물품이 없습니다.</p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <div class="flex items-center gap-4 bg-[#f9fbfa] px-4 min-h-[72px] py-2 justify-between">
                      <div class="flex flex-col justify-center">
                      <p class="text-[#101913] text-base font-medium leading-normal line-clamp-1">{item.name}</p>
                      <p class="text-[#5a8c6d] text-sm font-normal leading-normal line-clamp-2">가격: {item.price.toLocaleString()} 원 | 수량: {item.stock} 개</p>
                      </div>
                      <div class="shrink-0">
                      {item.stock > 0 ? (
                        <MarketBuyModal item={item} onConfirm={handleBuy} />
                      ) : (
                        <button disabled>품절</button>
                      )}
                      </div>
                    </div>
                    <hr />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )} */}
      {/* 에러 모달 */}
      <Dialog open={errorModal.open} onOpenChange={() => setErrorModal({ ...errorModal, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
          </DialogHeader>
          <div>{errorModal.message}</div>
          <DialogFooter>
            <Button onClick={() => setErrorModal({ ...errorModal, open: false })}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 구매 성공 모달 */}
      <Dialog open={purchaseSuccess.open} onOpenChange={() => setPurchaseSuccess({ ...purchaseSuccess, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>구매 완료</DialogTitle>
          </DialogHeader>
          <div>{purchaseSuccess.itemName} 구매 요청이 제출되었습니다!</div>
          <DialogFooter>
            <Button onClick={() => setPurchaseSuccess({ ...purchaseSuccess, open: false })}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketPage;
