"use client";

import * as React from "react";
import { Search as SearchButton, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchProps<T> {
  /** Array of items to search through */
  items: T[];
  /** Function to extract searchable text from each item */
  getSearchableText: (item: T) => string[];
  /** Callback when search results change */
  onSearchResults: (results: T[]) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Initial search value */
  defaultValue?: string;
}

export interface SearchRef {
  /** Clear the search input */

  clear: () => void;
  /** Focus the search input */
  focus: () => void;
  /** Get current search value */
  getValue: () => string;
  /** Set search value programmatically */
  setValue: (value: string) => void;
}

function SearchInputInner<T>(
  {
    items,
    getSearchableText,
    onSearchResults,
    placeholder = "Search...",
    className,
    debounceMs = 300,
    defaultValue = "",
    ...props
  }: SearchProps<T>,
  ref: React.Ref<SearchRef>
) {
  const [searchValue, setSearchValue] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const lastItemsRef = React.useRef<T[]>([]);
  const lastSearchRef = React.useRef<string>("");

  // Perform search function
  const performSearch = React.useCallback(
    (searchTerm: string, currentItems: T[]) => {
      if (!searchTerm.trim()) {
        onSearchResults(currentItems);
        return;
      }

      const lowerSearchTerm = searchTerm.toLowerCase().trim();

      const filteredItems = currentItems.filter((item) => {
        const searchableTexts = getSearchableText(item);
        return searchableTexts.some((text: string) =>
          text.toLowerCase().includes(lowerSearchTerm)
        );
      });

      onSearchResults(filteredItems);
    },
    [getSearchableText, onSearchResults]
  );

  // Handle search input changes with debouncing
  const handleInputChange = React.useCallback(
    (value: string) => {
      setSearchValue(value);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        performSearch(value, items);
        lastSearchRef.current = value;
      }, debounceMs);
    },
    [items, performSearch, debounceMs]
  );

  // Handle when items change (new data loaded)
  React.useEffect(() => {
    // Only run if items actually changed (different length or different content)
    const itemsChanged =
      lastItemsRef.current.length !== items.length ||
      JSON.stringify(lastItemsRef.current) !== JSON.stringify(items);

    if (itemsChanged) {
      lastItemsRef.current = items;
      // Re-run the last search with new items
      performSearch(lastSearchRef.current, items);
    }
  }, [items, performSearch]);

  // Initial search on mount
  React.useEffect(() => {
    if (items.length > 0) {
      performSearch(searchValue, items);
      lastSearchRef.current = searchValue;
      lastItemsRef.current = items;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Expose methods through ref
  React.useImperativeHandle(
    ref,
    () => ({
      clear: () => {
        setSearchValue("");
        handleInputChange("");
        inputRef.current?.focus();
      },
      focus: () => {
        inputRef.current?.focus();
      },
      getValue: () => searchValue,
      setValue: (value: string) => {
        setSearchValue(value);
        handleInputChange(value);
      },
    }),
    [searchValue, handleInputChange]
  );

  const handleClear = () => {
    setSearchValue("");
    handleInputChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative flex items-center", className)} {...props}>
      <SearchButton className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "shadow-md",
          "pl-10", // Space for search icon
          searchValue ? "pr-10" : "pr-3" // Space for clear button when there's text
        )}
      />
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 rounded-xs"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

const SearchInput = React.forwardRef(SearchInputInner) as <T>(
  props: SearchProps<T> & { ref?: React.Ref<SearchRef> }
) => React.ReactElement;

// Add displayName to the function
(SearchInput as typeof SearchInput & { displayName: string }).displayName = "SearchInput";

export { SearchInput as Search };
