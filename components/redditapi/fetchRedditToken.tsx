// lib/fetchRedditToken.ts
const fetchToken = async () => {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Reddit API credentials are missing!");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "CryptoInfoFetcher/1.0 by Acrobatic_Fee_5514",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("Failed to fetch token");
  const data = await res.json();
  return data.access_token;
};

export default fetchToken;
