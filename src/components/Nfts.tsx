export interface NftInfo {
  name: string;
  image_url: string;
  contract_address?: string;
  token_id?: string;
}

function getApiKey(): string {
  const key = process.env.OPENSEA_API_KEY;
  if (!key) throw new Error("OPENSEA_API_KEY is missing!");
  return key;
}

export const fetchNftInfo = async (): Promise<NftInfo[]> => {
  const apiKey = getApiKey();
  const options: RequestInit = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-API-KEY": apiKey,
    },
    next: { revalidate: 300 }, // refresh every 5 minutes
  };

  try {
    const response = await fetch(
      "https://api.opensea.io/api/v2/orders/ethereum/seaport/listings?order_direction=desc",
      options,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data && Array.isArray(data.orders)) {
      const allNfts = data.orders.flatMap(
        (order: Record<string, unknown>) =>
          (order.maker_asset_bundle as { assets?: Record<string, unknown>[] })?.assets?.map((asset) => ({
            name: asset.name || "Unnamed",
            image_url: asset.image_url || "",
            contract_address: (asset.asset_contract as { address?: string } | undefined)?.address || "",
            token_id: asset.token_id || "",
          })) || [],
      );

      // Shuffle once per fetch and cap to 20
      for (let i = allNfts.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [allNfts[i], allNfts[j]] = [allNfts[j], allNfts[i]];
      }

      return allNfts.slice(0, 20);
    } else {
      console.error("Expected data structure is missing:", data);
      return [];
    }
  } catch (error: any) {
    console.error("Error fetching NFT info:", error?.message || error);
    return [];
  }
};
