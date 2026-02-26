"use client";

const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #0d131d 25%, #1a2332 50%, #0d131d 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }
`;

export default function Loading() {
  return (
    <div className="bg-black min-h-screen">
      <style>{shimmerStyle}</style>
      <div className="skeleton h-screen w-full" />
    </div>
  );
}
