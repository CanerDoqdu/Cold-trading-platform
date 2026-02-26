import axios from "axios";

// Manually setting the values instead of using process.env
const CLIENT_ID = "k7RKJ1BeD01CThFm7kMr3A"; // Replace with your Reddit client ID
const CLIENT_SECRET = "1CW6Aw0Ywajlupf7Z40PMesa4lNmAQ"; // Replace with your Reddit client secret
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

// Function to fetch the Reddit access token
export async function getAccessToken(): Promise<string | null> {
  // Creating the Basic Auth header by base64 encoding the CLIENT_ID and CLIENT_SECRET
  const authHeader = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`;

  try {
    // Sending POST request with the correct headers and body for the client_credentials flow
    const response = await axios.post(REDDIT_TOKEN_URL, "grant_type=client_credentials", {
      headers: {
        "Authorization": authHeader, // Using the Basic Authentication header
        "User-Agent": "CryptoInfoFetcher/1.0 by Acrobatic_Fee_5514",
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    

    // Return the access token from the response
    return response.data.access_token;
  } catch (error) {
    // Handle error if token retrieval fails
    const errAny = error as Record<string, unknown>;
    console.error("Error obtaining access token:", errAny['response'] ? (errAny['response'] as Record<string, unknown>)['data'] : (error instanceof Error ? error.message : String(error)));
    return null;
  }
}
