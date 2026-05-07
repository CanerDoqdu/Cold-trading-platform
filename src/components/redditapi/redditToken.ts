const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USER_AGENT = process.env.USER_AGENT || 'CryptoInfoFetcher/1.0';
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

// Function to fetch the Reddit access token
export async function getAccessToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Reddit API credentials are not configured.');
    return null;
  }

  // Creating the Basic Auth header by base64 encoding the CLIENT_ID and CLIENT_SECRET
  const authHeader = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`;

  try {
    const response = await fetch(REDDIT_TOKEN_URL, {
      method: 'POST',
      headers: {
        "Authorization": authHeader,
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error obtaining access token:', errorBody || response.statusText);
      return null;
    }

    const data = await response.json();

    // Return the access token from the response
    return data.access_token || null;
  } catch (error) {
    console.error("Error obtaining access token:", error instanceof Error ? error.message : String(error));
    return null;
  }
}
