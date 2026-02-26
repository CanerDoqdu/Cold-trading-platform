"use client"; // Ensures that this component is rendered only on the client side
import React from "react";
import { useWebSocket } from "@/components/WebSocketContext"; // Adjust the import path if needed

const ClientOnlyMarketCapData = () => {
  const { marketCapData } = useWebSocket(); // Get market cap data from context

  return (
    <div className="grid grid-cols-3 gap-6 mt-6">
      {marketCapData.map((coin) => (
        <div
          key={coin.Name}
          className="bg-gray-900 p-4 rounded-lg shadow-md text-center hover:scale-105 transition-transform"
        >
          <h2 className="text-2xl font-semibold">{coin.FullName}</h2>
          <p className="text-gray-400">Symbol: {coin.Name}</p>
          <p className="text-emerald-400">24h Volume: ${coin.totalVolume24h}</p>
        </div>
      ))}
    </div>
  );
};

export default ClientOnlyMarketCapData;
