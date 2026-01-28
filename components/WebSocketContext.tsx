"use client";
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";

// WebSocketContextType tipini genişletiyoruz
interface WebSocketContextType {
  prices: { [key: string]: string | null };
  marketCapData: any[];
  setPrice: (coin: string, price: string) => void;
  isConnected: boolean;
}

// WebSocketProviderProps tipini oluşturuyoruz, children özelliğini dahil ediyoruz
interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Throws error if used outside provider - for components that REQUIRE websocket
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

// Returns null if used outside provider - for components that can work without websocket
export const useOptionalWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [prices, setPrices] = useState<{ [key: string]: string | null }>({});
  const [marketCapData, setMarketCapData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    // Prevent connection if already connected or connecting
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE;
    if (!apiKey) {
      console.error("API Key is missing!");
      return;
    }

    const socket = new WebSocket(
      `wss://streamer.cryptocompare.com/v2?api_key=${apiKey}`
    );

    socket.onopen = () => {
      if (!mountedRef.current) {
        socket.close();
        return;
      }
      console.log("WebSocket connected");
      setIsConnected(true);
      const coinsToSubscribe = ["BTC", "ETH", "SOL"].map(
        (coin) => `5~CCCAGG~${coin}~USD`
      );
      socket.send(JSON.stringify({ action: "SubAdd", subs: coinsToSubscribe }));
    };

    socket.onmessage = (event) => {
      if (!mountedRef.current) return;
      const data = JSON.parse(event.data);
      if (data.TYPE === "5" && data.PRICE) {
        const price = data.PRICE.toFixed(2);
        const coin = data.FROMSYMBOL;
        setPrices((prevPrices) => ({ ...prevPrices, [coin]: price }));
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      if (!mountedRef.current) return;
      console.log("WebSocket closed");
      setIsConnected(false);
      wsRef.current = null;
    };

    wsRef.current = socket;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Small delay to avoid Strict Mode issues
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        connect();
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  useEffect(() => {
    const fetchMarketCapData = async () => {
      try {
        const response = await fetch(
          "https://min-api.cryptocompare.com/data/top/mktcap?assetClass=ALL&tsym=USD"
        );
        const result = await response.json();
        if (result.Message === "Success") {
          const parsedData = result.Data.map((coin: any) => ({
            Name: coin.CoinInfo.Name,
            FullName: coin.CoinInfo.FullName,
            totalVolume24h: coin.ConversionInfo.TotalVolume24H.toFixed(2),
          }));
          setMarketCapData(parsedData);
        }
      } catch (error) {
        console.error("Error fetching market cap data:", error);
      }
    };
  
    fetchMarketCapData();
  }, []);

  const setPrice = (coin: string, price: string) => {
    setPrices((prevPrices) => ({ ...prevPrices, [coin]: price }));
  };

  return (
    <WebSocketContext.Provider value={{ prices, marketCapData, setPrice, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
