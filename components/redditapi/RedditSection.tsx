// app/reddit-section/page.tsx
import { getRedditData } from '@/components/redditapi/redditApi'; // Reddit data fetching logic

// Server component that fetches Reddit data
const RedditSection = async () => {
  // Fetch Reddit data server-side
  const posts = await getRedditData();

  if (!posts) {
    return (
      <div className="text-gray-400 text-xs py-2">
        Loading Reddit posts...
      </div>
    );
  }

  return (
    <div>
      {posts.slice(0, 3).map((post, index) => (
        <a
          key={index}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-gray-400 hover:text-blue-400 transition cursor-pointer line-clamp-1 py-1.5 min-h-[36px] items-center"
        >
          {post.title}
        </a>
      ))}
    </div>
  );
};

export default RedditSection;
