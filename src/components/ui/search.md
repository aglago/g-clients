# Generic Search Component

A reusable, fully functional search component for filtering arrays of data with debouncing, TypeScript support, and a clean UI following the project's design system.

## Features

- 🔍 **Real-time Search**: Instantly filters items as you type
- ⏱️ **Debounced**: Configurable debounce delay to optimize performance (default: 300ms)
- 🎯 **Generic**: Works with any data type using TypeScript generics
- 🧹 **Clean UI**: Matches the project's Shadcn/UI design system
- 🎛️ **Flexible**: Customizable search text extraction
- ⌨️ **Keyboard Friendly**: Focus management and clear button
- 🎨 **Accessible**: ARIA labels and proper focus handling

## Usage

### Basic Example

```tsx
'use client'

import { useState } from 'react'
import { Search } from '@/components/ui/search'

interface User {
  id: string
  name: string
  email: string
}

export default function UserList() {
  const [users] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ])
  
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users)

  const handleSearchResults = (results: User[]) => {
    setFilteredUsers(results)
  }

  const getUserSearchableText = (user: User): string[] => {
    return [user.name, user.email]
  }

  return (
    <div>
      <Search
        items={users}
        getSearchableText={getUserSearchableText}
        onSearchResults={handleSearchResults}
        placeholder="Search users..."
      />
      
      {/* Render filtered results */}
      {filteredUsers.map(user => (
        <div key={user.id}>{user.name} - {user.email}</div>
      ))}
    </div>
  )
}
```

### Advanced Example with Ref

```tsx
'use client'

import { useState, useRef } from 'react'
import { Search, SearchRef } from '@/components/ui/search'
import { Button } from '@/components/ui/button'

export default function AdvancedSearch() {
  const searchRef = useRef<SearchRef>(null)
  // ... other state

  const handleClearSearch = () => {
    searchRef.current?.clear()
  }

  const handleFocusSearch = () => {
    searchRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Search
          ref={searchRef}
          items={items}
          getSearchableText={getSearchableText}
          onSearchResults={handleSearchResults}
          placeholder="Search..."
          debounceMs={500} // Custom debounce delay
          defaultValue="initial search" // Initial search value
        />
        <Button onClick={handleClearSearch}>Clear</Button>
        <Button onClick={handleFocusSearch}>Focus</Button>
      </div>
      
      {/* Results */}
    </div>
  )
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | - | **Required.** Array of items to search through |
| `getSearchableText` | `(item: T) => string[]` | - | **Required.** Function that returns searchable text from each item |
| `onSearchResults` | `(results: T[]) => void` | - | **Required.** Callback when search results change |
| `placeholder` | `string` | `"Search..."` | Placeholder text for the input |
| `className` | `string` | - | Additional CSS classes |
| `debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `defaultValue` | `string` | `""` | Initial search value |

### Ref Methods

The component exposes these methods via `ref`:

```tsx
interface SearchRef {
  clear: () => void          // Clear the search input
  focus: () => void          // Focus the search input  
  getValue: () => string     // Get current search value
  setValue: (value: string) => void // Set search value programmatically
}
```

### Search Behavior

- **Case Insensitive**: All searches are case insensitive
- **Partial Match**: Searches for partial matches within the searchable text
- **Multiple Fields**: Searches across all strings returned by `getSearchableText`
- **Debounced**: Search is debounced to avoid excessive filtering on every keystroke
- **Empty Search**: When search is empty, returns all original items

## Examples by Data Type

### 1. Tracks Search

```tsx
const getTrackSearchableText = (track: Track): string[] => {
  return [
    track.name || '',
    track.description || '',
    track.instructor || '',
    `${track.price}`, // Convert numbers to strings
    `${track.duration}`,
  ].filter(Boolean) // Remove empty strings
}
```

### 2. Courses Search

```tsx
const getCourseSearchableText = (course: Course): string[] => {
  return [
    course.title || '',
    course.description || '',
    course.track || '',
  ].filter(Boolean)
}
```

### 3. Invoices Search

```tsx
const getInvoiceSearchableText = (invoice: Invoice): string[] => {
  return [
    invoice.id || '',
    invoice.status || '',
    `${invoice.amount}`,
    // Include related data
    learner?.firstName || '',
    learner?.lastName || '',
    learner?.email || '',
    // Format dates
    new Date(invoice.createdAt).toLocaleDateString(),
  ].filter(Boolean)
}
```

## Integration with TanStack Query

The component works seamlessly with TanStack Query:

```tsx
const { data: items = [] } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
})

// Update filtered items when query data changes
useEffect(() => {
  setFilteredItems(items)
}, [items])
```

## Styling Customization

The component uses the project's design system and can be customized:

```tsx
<Search
  className="w-full max-w-lg" // Custom width
  // ... other props
/>
```

## Performance Tips

1. **Optimize `getSearchableText`**: Only include necessary fields
2. **Use Debouncing**: Adjust `debounceMs` based on data size
3. **Filter Early**: Pre-filter large datasets before passing to the component
4. **Memoize Functions**: Use `useCallback` for the search text function if needed

## Accessibility

- Search icon and clear button are properly labeled
- Keyboard navigation works as expected
- Focus management handles clearing and focusing
- ARIA attributes are included for screen readers