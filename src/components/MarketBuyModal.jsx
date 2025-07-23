// components/MarketBuyModal.jsx
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "./ui/dialog";
import { Button } from "./ui/button";

const MarketBuyModal = ({ item, onConfirm }) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm(item);       // MarketPage의 handleBuy(item) 호출
    setOpen(false);        // 모달 닫기
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#7F8BC2] to-[#3D5799] text-white text-[10px] font-900 rounded-3xl w-[140px] h-[31px]">구매하기</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>정말 {item.name}을</DialogTitle>
          <DialogTitle>구매하시겠습니까?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">아니요</Button>
          </DialogClose>
          <Button onClick={handleConfirm} className="bg-green-500 text-white">
            구매하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarketBuyModal;
