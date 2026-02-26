import axios from "axios";
import cache from "memory-cache";
import { getAccessToken } from "@/components/redditapi/redditToken";

const REDDIT_URL = "https://oauth.reddit.com/r/bitcoin/hot?limit=3";

async function getCachedAccessToken(): Promise<string> {
    // Check if the token exists in cache
    let accessToken = cache.get('redditAccessToken');
    
    if (!accessToken) {
      console.log("Access token not found in cache. Attempting to fetch a new token...");
      accessToken = await getAccessToken();  // Fetch a new token
  
      if (accessToken) {
        // Save the token in cache for 1 hour
        cache.put('redditAccessToken', accessToken, 3600000);  // 3600000 ms = 1 hour
      } else {
        console.error("Failed to fetch new access token.");
      }
    }
  
    return (accessToken as string) || '';  // Return the token or an empty string if not found
  }
  
export async function getRedditData() {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.error("Access token not available.");
      throw new Error("Failed to retrieve access token");
    }
  
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'MyRedditBot/0.1 by Acrobatic_Fee_5514',
    };
  
    try {
      const response = await axios.get(REDDIT_URL, { headers });
      const posts = response.data.data.children.map((post: any) => ({
        title: post.data.title,
        url: post.data.url,
      }));
  
      return posts;
    } catch (error) {
      const errAny = error as Record<string, unknown>;
      if (errAny['response']) {
        console.error("Error fetching Reddit data:", (errAny['response'] as Record<string, unknown>)['data']);
      } else {
        console.error("Error fetching Reddit data:", error instanceof Error ? error.message : String(error));
      }
      throw new Error("Reddit API request failed");
    }
  }
  