import React, {useState} from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const CoinSellModal = ({ amount, onConfirm, currentPrice }) => {
    const [showResult, setShowResult] = useState(false);
    const [earned, setEarned] = useState(0);
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        const total = amount * currentPrice;
        setEarned(total);
        setShowResult(true);
        onConfirm?.();
    };

    const handleClose = () => {
        setShowResult(false);
        setEarned(0);
        setOpen(false);
    }


    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    className="bg-gradient-to-r from-[#7f8bc2] to-[#3d5799] text-white font-bold rounded-3xl"
                    onClick={()=>setOpen(true)}    
                >
                    코인 판매하기
                </Button>
            </DialogTrigger>

            {/*판매 확인 모달*/}
            {!showResult && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>정말 {amount}개를 판매하시겠습니까?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleClose}>취소</Button>
                        </DialogClose>
                        <Button onClick={handleConfirm} className="bg-green-500 text-white">
                            판매 확정
                        </Button>
                    </DialogFooter>
                </DialogContent>
            )}

            {/*판매 완료 모달*/}
            {showResult && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>판매 완료!</DialogTitle>
                    </DialogHeader>
                    <div className="text-center text-lg font-semibold">
                        {earned.toLocaleString()}원 획득
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="mt-2" onClick={handleClose}>닫기</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    );
    
};

export default CoinSellModal;