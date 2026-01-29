const API_KEY = process.env.OPENSEA_API_KEY;

interface OpenSeaItem {
  token_id: string;
  image_url: string;
  name: string;
  identifier: string;
  bestOffer?: {
    value: string;
    currency: string;
  };
}

if (!API_KEY) {
  throw new Error("API Key is missing!");
}

const fetchOptions: RequestInit = {
  method: "GET",
  headers: {
    "X-API-KEY": API_KEY,
    Accept: "application/json",
  },
};

// Function to fetch NFTs for a collection
export async function getNFTs(slug: string) {
  const res = await fetch(
    `https://api.opensea.io/api/v2/collection/${slug}/nfts`,
    {
      ...fetchOptions,
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API Error Response (NFTs):", errorData);
    throw new Error("Failed to fetch collection NFTs");
  }

  const data = await res.json();
  return data.nfts; // Return only NFTs
}

// Function to fetch stats for a collection
export async function getCollectionStats(collectionName: string) {
  const res = await fetch(
    `https://api.opensea.io/api/v2/collections/${collectionName}/stats`,
    {
      ...fetchOptions, // Fetch ayarlarını buradan alıyor
      next: { revalidate: 60 }, // Önbelleğe alma süresi 60 saniye
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API Error Response (Stats):", errorData);
    throw new Error("Failed to fetch collection stats");
  }

  const data = await res.json();
  return data; // Return the stats
}

// Function to fetch collection items (basic info)
export async function getCollectionItems(collectionName: string) {
  const res = await fetch(
    `https://api.opensea.io/api/v2/collections/${collectionName}`,
    {
      ...fetchOptions, // Fetch ayarlarını buradan alıyor
      next: { revalidate: 60 }, // Önbelleğe alma süresi 60 saniye
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API Error Response:", errorData);
    throw new Error("Failed to fetch collection info");
  }

  const data = await res.json();
  return data; // Return collection-level information
}

// Function to fetch the best offer for a specific NFT
// Function to fetch the best offer for a specific NFT
export async function getBestOfferForNFT(
  collectionSlug: string,
  identifier: string,
  retryDelay: number = 60000 // 60 seconds default delay
): Promise<any> {
  const res = await fetch(
    `https://api.opensea.io/api/v2/offers/collection/${collectionSlug}/nfts/${identifier}/best`,
    {
      ...fetchOptions,
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    // Try to parse error, but handle empty responses gracefully
    let errorData: { detail?: string } = {};
    try {
      const text = await res.text();
      if (text) {
        errorData = JSON.parse(text);
      }
    } catch {
      // Response was empty or not valid JSON
    }
    
    // Only log if there's actual error data
    if (Object.keys(errorData).length > 0) {
      console.error(`Error fetching best offer for ${identifier}:`, errorData);
    }
    
    // Check for throttling error
    if (errorData.detail && errorData.detail.includes("Request was throttled")) {
      console.log(`Throttled for ${identifier}, retrying after ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay)); // wait before retrying
      return getBestOfferForNFT(collectionSlug, identifier, retryDelay); // retry the request
    }

    throw new Error(`Failed to fetch best offer for NFT ${identifier}`);
  }

  const data = await res.json();
  return data; // Return the best offer
}


// Function to fetch collection items (basic info)
export async function getDescription(collectionName: string) {
  const res = await fetch(
    `https://api.opensea.io/api/v2/collections/${collectionName}`,
    {
      ...fetchOptions, // Fetch ayarlarını buradan alıyor
      next: { revalidate: 60 }, // Önbelleğe alma süresi 60 saniye
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API Error Response:", errorData);
    throw new Error("Failed to fetch collection info");
  }

  const data = await res.json();
  return data.description; // Return collection-level information
}