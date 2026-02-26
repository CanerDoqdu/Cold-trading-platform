

const COINS_INFO_URL = 'https://min-api.cryptocompare.com/data/top/totalvol?tsym=USD';
const API_KEY = process.env.CRYPTOCOMPARE;

export interface CoinGeneralInfo {
  Id: string;
  Name: string;
  FullName: string;
  ImageUrl: string;
  TotalVolume: string;
}

export const CryptoTop24hVolumeList = async () => {
  try {
     const response = await fetch(`${COINS_INFO_URL}&api_key=${API_KEY}`);
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
     const data = await response.json();
     
     // Check if data has valid structure
     if (data && data.Data && Array.isArray(data.Data)) {
       return data.Data.map((coin: any) => ({
         Id: coin.CoinInfo.Id,
         Name: coin.CoinInfo.Name,
         FullName: coin.CoinInfo.FullName,
         ImageUrl: `https://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
         TotalVolume: coin.ConversionInfo.TotalVolume24H
       }));
     } else {
       throw new Error('Invalid data format');
     }
   } catch (error) {
     console.error("Error fetching coin info:", error);
     return [];
   }
}
