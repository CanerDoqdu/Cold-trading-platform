export interface NftInfo {
  name: string;
  image_url: string;
  openSeaUrl?: string;
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
      "https://api.opensea.io/api/v2/collections?chain=ethereum&order_by=market_cap&offset=0&limit=20",
      options,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data && Array.isArray(data.collections)) {
      const allNfts = data.collections.map((collection: Record<string, unknown>) => {
        const slug = String(collection.slug || collection.collection || "");
        const imageUrl = String(collection.image_url || collection.image || "");

        return {
          name: String(collection.name || "Unnamed"),
          image_url: imageUrl,
          openSeaUrl: slug ? `https://opensea.io/collection/${slug}` : undefined,
        };
      });

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
