"use client";

import React, { useState, useEffect } from "react";
import { StarIcon as SolidStar } from "@heroicons/react/24/solid";
import { StarIcon as OutlineStar } from "@heroicons/react/24/outline";
import { UseAuthContext } from "@/hooks/UseAuthContext";

interface StarToggleProps {
  coinId: string; // Coin ID (e.g., "bitcoin", "ethereum")
}

const StarToggle: React.FC<StarToggleProps> = ({ coinId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = UseAuthContext();
  const { user } = state;

  useEffect(() => {
    // Load initial favorite state
    if (user) {
      // If logged in, fetch from API
      fetchFavoriteStatus();
    } else {
      // If not logged in, use localStorage
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        const favoriteSet = new Set(JSON.parse(savedFavorites));
        setIsFavorite(favoriteSet.has(coinId));
      }
    }
  }, [coinId, user]);

  const fetchFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/user/favorites');
      const data = await response.json();
      if (data.favorites) {
        setIsFavorite(data.favorites.includes(coinId));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    if (isLoading) return;

    if (user) {
      // If logged in, save to database
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinId }),
        });
        const data = await response.json();
        if (response.ok) {
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('Error updating favorite:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If not logged in, use localStorage
      setIsFavorite((prev) => {
        const newFavorites = new Set(
          JSON.parse(localStorage.getItem("favorites") || "[]")
        );

        if (newFavorites.has(coinId)) {
          newFavorites.delete(coinId);
        } else {
          newFavorites.add(coinId);
        }

        localStorage.setItem("favorites", JSON.stringify(Array.from(newFavorites)));
        return !prev;
      });
    }
  };

  return (
    <span 
      className={`cursor-pointer transition-transform ${isLoading ? 'opacity-50' : 'hover:scale-110'}`} 
      onClick={toggleFavorite}
    >
      {isFavorite ? (
        <SolidStar className="w-6 h-6 text-yellow-500" />
      ) : (
        <OutlineStar className="w-6 h-6 text-gray-400 hover:text-yellow-400" />
      )}
    </span>
  );
};

export default StarToggle;
