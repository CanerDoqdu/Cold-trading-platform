// Client component that renders Reddit posts
'use client';

interface RedditPost {
  title: string;
  url: string;
}

interface RedditSectionClientProps {
  posts: RedditPost[] | null;
}

const RedditSectionClient = ({ posts }: RedditSectionClientProps) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-gray-400 text-xs py-2">
        No Reddit posts available.
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
          className="block text-xs text-gray-400 hover:text-blue-400 transition cursor-pointer line-clamp-1 py-1"
        >
          {post.title}
        </a>
      ))}
    </div>
  );
};

export default RedditSectionClient;
