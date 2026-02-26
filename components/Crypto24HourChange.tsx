const BASE_URL = "https://min-api.cryptocompare.com/data/pricemultifull";
const API_KEY = process.env.CRYPTOCOMPARE;
export const fetchCryptoChange = async (): Promise<CryptoChanges> => {
  try {
    const response = await fetch(
      `${BASE_URL}?fsyms=BTC,ETH,SOL,ADA,XRP,DOGE&tsyms=USD&api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status code: ${response.status}, Status text: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.RAW) {
      throw new Error("Invalid data structure: 'RAW' field missing in response");
    }
    const changes: CryptoChanges = {
      BTC: data.RAW.BTC.USD.CHANGEPCTDAY?.toFixed(2) || null,
      ETH: data.RAW.ETH.USD.CHANGEPCTDAY?.toFixed(2) || null,
      SOL: data.RAW.SOL.USD.CHANGEPCTDAY?.toFixed(2) || null,
      ADA: data.RAW.ADA.USD.CHANGEPCTDAY?.toFixed(2) || null,
      XRP: data.RAW.XRP.USD.CHANGEPCTDAY?.toFixed(2) || null,
      DOGE: data.RAW.DOGE.USD.CHANGEPCTDAY?.toFixed(2) || null,
    };

    return changes;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error fetching 24-hour changes:", msg);
    return { BTC: null, ETH: null, SOL: null, ADA: null, XRP: null, DOGE: null };
  }
};

export interface CryptoChanges {
  BTC: string | null;
  ETH: string | null;
  SOL: string | null;
  ADA: string | null;
  XRP: string | null;
  DOGE: string | null;
}
