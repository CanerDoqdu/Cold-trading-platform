"use client"; // This marks the file as a client component

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import StarToggle from "@/components/StarToggle";
import LoadMoreButton from "@/components/loading/LoadMoreButton";
import { NFTData } from "@/types/coin";

interface CollectionItemProps {
  collection: NFTData;
}

const CollectionList: React.FC<{ initialData: CollectionItemProps[] }> = ({ initialData }) => {
  const [items, setItems] = useState(initialData);  // Use SSR data as the initial state
  const [offset, setOffset] = useState(initialData.length); // Keep track of the data offset for CSR

  return (
    <>
      <table className="min-w-full table-auto bg-black text-white rounded-lg shadow-lg">
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-gray-700 hover:bg-gray-800 transition-all">
              <td className="px-4 py-2 text-left flex items-center">
                <StarToggle coinId={String(item.collection.collection || '')} />
                <span className="text-left">{index + 1}</span>
              </td>
              <td className="px-4 py-4 text-left flex items-center">
                <Link href={`/nftrankings/${String(item.collection.collection || '')}`}>
                  <div className="flex items-center">
                    <Image src={String(item.collection.image_url || '')} alt={String(item.collection.name || '')} width={60} height={60} />
                    <div className="ml-2">
                      <span className="truncate text-[16px] font-semibold">{String(item.collection.name || '')}</span>
                      <div className="text-sm text-gray-400">{String(item.collection.chain || '')}</div>
                    </div>
                  </div>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Load More Button to load more items */}
      <LoadMoreButton setItems={setItems} offset={offset} />
    </>
  );
};

export default CollectionList;
