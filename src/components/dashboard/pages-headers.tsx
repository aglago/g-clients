"use client";

import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { Search, SearchRef } from "@/components/ui/search";

interface PagesHeadersProps<T> {
  heading: string;
  subheading: string;
  // Search-related props
  items: T[];
  getSearchableText: (item: T) => string[];
  onSearchResults: (results: T[]) => void;
  searchPlaceholder: string;
  addButtonText: string;
  onAddClick?: () => void;
  isLoading?: boolean;
  showAddButton?: boolean;
}

export default function PagesHeaders<T>({
  heading,
  subheading,
  items,
  getSearchableText,
  onSearchResults,
  searchPlaceholder,
  addButtonText,
  onAddClick,
  isLoading = false,
  showAddButton = true,
}: PagesHeadersProps<T>) {
  const searchRef = useRef<SearchRef>(null);

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      console.log(`Add ${addButtonText} clicked`);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 font-figtree">
        <h2 className="font-semibold text-2xl text-foreground">{heading}</h2>
        <p className="text-[18px] text-muted-foreground">{subheading}</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full max-w-md">
            <Search
              ref={searchRef}
              items={items}
              getSearchableText={getSearchableText}
              onSearchResults={onSearchResults}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </div>

          {showAddButton && (
            <div className="flex">
              <Button onClick={handleAddClick} disabled={isLoading}>
                <Plus className="size-4 mr-2" />
                {addButtonText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
