"use client";
// components/ExpandableText.tsx

import { useState } from "react";

interface ExpandableTextProps {
  description: string;
}

export default function ExpandableText({ description }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Split the description into words
  const words = description?.split(" ") || [];
  const displayedText = isExpanded ? description : words.slice(0, 20).join(" "); // Show only the first 15 words

  return (
    <div className="my-4 ">
      <div
        className={`description ${isExpanded ? "max-h-none" : "max-h-12 flex overflow-hidden"}`}
      >
        <div className=" items-start">
          <div>
            <span>{displayedText}</span>
            {words.length > 15 && !isExpanded && " ..."}{" "}
            {/* Show "..." if there's more text */}
          </div>
        </div>

        {/* Display 'See more' button inline */}
        {!isExpanded && words.length > 15 && (
          <button onClick={toggleExpand} className="text-blue-500 ml-2">
            See more
          </button>
        )}
      </div>

      {/* Show 'See less' button below expanded text */}
      {isExpanded && (
        <div className="flex justify-start mt-2">
          <button onClick={toggleExpand} className="text-blue-500">
            See less
          </button>
        </div>
      )}

      <style jsx>{`
        .description {
          transition: max-height 0.3s ease;
        }
      `}</style>
    </div>
  );
}
