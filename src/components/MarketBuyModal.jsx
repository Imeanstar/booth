import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const MarketBuyModal = ({ item, onConfirm }) => {
  const [open, setOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleBuy = () => {
    onConfirm(item); // 부모로부터 전달받은 구매 로직 실행
    setShowResult(true);
  };

  const handleClose = () => {
    setShowResult(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex min-w-[84px] h-8 px-4 bg-[#e9f1ec] text-[#101913] text-sm font-medium leading-normal w-fit"
          onClick={() => setOpen(true)}
        >
          구매하기
        </Button>
      </DialogTrigger>

      {!showResult && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 "{item.name}"을</DialogTitle>
            <DialogTitle>구매하시겠습니까?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleClose}>아니요</Button>
            </DialogClose>
            <Button onClick={handleBuy} className="bg-green-500 text-white">
              구매하기
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {showResult && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>"{item.name}"을 구매 신청했습니다!</DialogTitle>
          </DialogHeader>
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

export default MarketBuyModal;
