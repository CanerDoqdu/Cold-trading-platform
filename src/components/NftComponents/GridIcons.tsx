// components/NftComponents/GridIcons.tsx
"use client"; // This is a client component

import { useState } from "react";
import Image from "next/image";

const gridOptions = [
  { id: 4, src: "/icons/4.svg", alt: "Four Grid" },
  { id: 5, src: "/icons/tekli.svg", alt: "One Grid" },
  { id: 9, src: "/icons/nine.svg", alt: "Nine Grid" },
];

interface GridIconsProps {
  onGridChange: (id: number) => void;
}

export default function GridIcons({ onGridChange }: GridIconsProps) {
  const [selectedGrid, setSelectedGrid] = useState<number>(4);

  const handleGridChange = (id: number) => {
    setSelectedGrid(id);
    onGridChange(id); // Notify parent of grid change
  };

  return (
    <div className="flex space-x-2">
      {gridOptions.map((grid) => (
        <div
          key={grid.id}
          className={`cursor-pointer p-2 ${selectedGrid === grid.id ? 'border border-white' : ''}`} // Highlight selected grid
          onClick={() => handleGridChange(grid.id)} // Change grid on click
        >
          <Image
            src={grid.src}
            alt={grid.alt}
            width={24}
            height={24}
            className="w-6 h-6 filter invert"
          />
        </div>
      ))}
    </div>
  );
}
