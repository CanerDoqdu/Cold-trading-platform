interface RedditPost {
  title: string;
  url: string;
  score: number; // score eklendi
  created: number; // created eklendi
  author: string; // author eklendi
}

export async function fetchRedditPosts(token: string): Promise<RedditPost[]> {
  try {
    const response = await fetch('https://oauth.reddit.com/r/Bitcoin/hot.json?limit=5', {
      headers: {
        'Authorization': `bearer ${token}`,
        'User-Agent': process.env.USER_AGENT || 'DefaultUserAgent',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const data = await response.json();
    return data.data.children.map((post: any) => ({
      title: post.data.title,
      url: post.data.url,
      score: post.data.score,
      created: post.data.created_utc,
      author: post.data.author,
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Error fetching Reddit posts');
  }
}
