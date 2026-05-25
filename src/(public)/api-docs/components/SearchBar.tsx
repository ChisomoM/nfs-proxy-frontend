import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search endpoints...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-gp-sky-500 focus-within:border-transparent">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-500 bg-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
