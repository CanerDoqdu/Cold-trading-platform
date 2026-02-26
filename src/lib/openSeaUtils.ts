const API_KEY = process.env.OPENSEA_API_KEY;

export const getCollectionItems = async (collectionName: string) => {
  if (!API_KEY) {
    throw new Error("API Key is missing!");
  }

  const res = await fetch(
    `https://api.opensea.io/api/v2/collections/${collectionName}`,
    {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("API Error Response:", errorData);
    throw new Error("Failed to fetch collection info");
  }

  const data = await res.json();
  console.log("API Response:", data);

  const description = data?.description;
  return description ?? "No description available for this collection.";
};
