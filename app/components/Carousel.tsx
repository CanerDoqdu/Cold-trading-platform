import React from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchgeneralinfo, CoinInfo } from "../../components/CryptoGeneralInfo";
import ScrollerAnimation from "@/components/CarouselAnimation";
// prettier-ignore
const coinSymbols = [
  "BTC", "ETH", "XRP", "LTC", "ADA", "DOT", "LINK", "XLM", "BNB", "SOL",
  "DOGE", "AVAX", "MATIC", "SHIB", "TRX", "UNI", "ATOM", "VET", "XMR", "ICP",
  "FIL", "AAVE", "SUSHI", "MKR", "ALGO", "FTT", "EGLD", "THETA", "AXS", "GRT",
  "RUNE", "LUNA", "CRV", "KSM", "ZIL", "ENJ", "BTT", "NEO", "CAKE", "MIOTA",
  "FLOW", "FTM", "TWT", "HNT", "1INCH", "QNT", "BAND", "CELO", "KAVA", "CHZ",
  "DGB", "RSR", "SAND", "COMP", "YFI", "REN", "ZRX", "OMG", "DASH", "NANO",
];

const Scroller: React.FC = async () => {
  const coinData: CoinInfo[] = await fetchgeneralinfo(coinSymbols);

  if (coinData.length === 0) {
    return <div>Loading...</div>;
  }

  const rows: CoinInfo[][] = [];
  for (let i = 0; i < coinData.length; i += 12) {
    rows.push(coinData.slice(i, i + 12));
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen space-y-4 max-w-[1920px] mx-auto py-20">
      <h1 className="text-center text-white text-[40px] mb-4 font-semibold">
        Build your crypto portfolio
      </h1>
      <p className="text-gray-400 text-center mb-12 max-w-xl">
        Start with as little as $10 and explore hundreds of cryptocurrencies
      </p>

      {rows.map((rowCoins, rowIndex) => (
        <div key={rowIndex} className={`scroller row${rowIndex + 1}`}>
          <ul className="tag-list scroller__inner">
            {rowCoins.map((coin, index) => (
              <li
                key={index}
                className="coin-box flex items-center justify-end bg-gray-100 rounded-lg min-h-[48px] hover:bg-gray-200 transition cursor-pointer"
                style={{ width: "auto", padding: "0 8px" }}
              >
                <Link href={`/markets/${coin.Name?.toLowerCase() || ''}`} className="flex items-center w-full">
                  <Image
                    src={coin.ImageUrl}
                    alt={`${coin.FullName} logo`}
                    width={30}
                    height={30}
                    className="w-[30px] h-[30px] object-contain rounded-full"
                    loading="lazy"
                  />
                  <span
                    className="text-right flex-grow truncate ml-1 mr-2"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {coin.FullName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ScrollerAnimation coinData={coinData} />
      <Link 
        href="/markets"
        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 !mt-14 border-b-4 rounded-lg border-b-emerald-800 font-bold py-3 px-8 text-black transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
      >
        Explore All Coins
      </Link>
    </div>
  );
};

export default Scroller;
