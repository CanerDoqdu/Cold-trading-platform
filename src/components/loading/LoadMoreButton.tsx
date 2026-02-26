"use client";
import React, { useState, useEffect } from "react";

interface LoadMoreButtonProps {
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
  offset: number;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ setItems, offset }) => {
  const [loading, setLoading] = useState(false);

  const fetchMoreData = async () => {
    if (loading) return; // Prevent multiple fetch requests
    setLoading(true);

    const apiUrl = `/api/getCombinedData?offset=${offset}&limit=20`; // Adjust API endpoint accordingly

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch data");

      const newItems = await res.json();
      setItems((prevItems) => [...prevItems, ...newItems]);
    } catch (error) {
      console.error("Error loading more items:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading) {
          fetchMoreData();
        }
      },
      { rootMargin: "100px" }
    );

    const loadMoreRef = document.getElementById("loadMoreRef");
    if (loadMoreRef) observer.observe(loadMoreRef);

    return () => {
      if (loadMoreRef) observer.unobserve(loadMoreRef);
    };
  }, [offset]);

  return (
    <>
      <div id="loadMoreRef" className="flex justify-center my-4">
        {loading ? <p>Loading...</p> : <p>Scroll down to load more...</p>}
      </div>
    </>
  );
};

export default LoadMoreButton;
