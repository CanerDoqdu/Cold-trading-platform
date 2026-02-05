let cachedPrices: { BTC?: number; ETH?: number; SOL?: number; ADA?: number; XRP?: number; DOGE?: number } = {};
let lastFetched: number = 0;

export const getCryptoPrices = async () => {
  const cacheDuration = 5 * 60 * 1000; // Cache duration: 5 minutes

  if (cachedPrices.BTC && Date.now() - lastFetched < cacheDuration) {
    console.log('Returning cached data');
    return {
      BTC: cachedPrices.BTC,
      ETH: cachedPrices.ETH,
      SOL: cachedPrices.SOL,
      ADA: cachedPrices.ADA,
      XRP: cachedPrices.XRP,
    };
  }

  const isServer = typeof window === 'undefined';
  const url = isServer
    ? `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple,dogecoin&vs_currencies=usd`
    : `/api/coingecko/simple_price?ids=bitcoin,ethereum,solana,cardano,ripple,dogecoin&vs_currencies=usd`;

  let data: any;
  try {
    const res = await fetch(url, isServer ? { next: { revalidate: 30 } } : {});
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    data = await res.json();
  } catch (err) {
    // Fallback to cached values if available
    if (cachedPrices.BTC) {
      console.warn('Simple price fetch failed, returning cached data');
      return {
        BTC: cachedPrices.BTC,
        ETH: cachedPrices.ETH,
        SOL: cachedPrices.SOL,
        ADA: cachedPrices.ADA,
        XRP: cachedPrices.XRP,
        DOGE: cachedPrices.DOGE,
      };
    }
    throw err;
  }
 
const prices = {
  BTC: data.bitcoin.usd,
  ETH: data.ethereum.usd,
  SOL: data.solana.usd,
  ADA: data.cardano.usd,
  XRP: data.ripple.usd,
  DOGE: data.dogecoin.usd,
};

  cachedPrices = prices;
  lastFetched = Date.now();

  return prices;
};
