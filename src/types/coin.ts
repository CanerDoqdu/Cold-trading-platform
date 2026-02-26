// types/coin.ts
export interface Coin {
    _id: string;
    name: string;
    image: string;
    price: number;
    marketCap: number;
    changePercentage: number;
}

export interface CryptoCompareData {
    Name: string;
    FullName: string;
    TotalVolume?: number | string;
    totalVolume24h?: string;
}

export interface NFTData {
    id: string | number;
    name: string;
    image?: string;
    description?: string;
    [key: string]: unknown;
}

export interface RedditPost {
    id: string;
    title: string;
    author: string;
    url: string;
    score: number;
    created_utc: number;
    [key: string]: unknown;
}
