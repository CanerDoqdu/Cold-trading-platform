"use client"
import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketContext";

interface CryptoPriceUpdaterProps {
  coin: string;
  initialPrice: string | null;
}

const CryptoPriceUpdater: React.FC<CryptoPriceUpdaterProps> = ({ coin, initialPrice }) => {
  const { prices } = useWebSocket();
  const [price, setPrice] = useState<string | null>(initialPrice);

  useEffect(() => {
    if (prices[coin]) {
      setPrice(prices[coin]);
    }
  }, [prices, coin]);

  return <p className="text-sm font-medium">${price || "Loading..."}</p>;
};

export default CryptoPriceUpdater;
