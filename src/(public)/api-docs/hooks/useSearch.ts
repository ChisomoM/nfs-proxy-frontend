import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { NormalizedEndpoint } from './useOpenAPISpec';

export function useSearch(endpoints: NormalizedEndpoint[]) {
  const fuse = useMemo(() => {
    return new Fuse(endpoints, {
      keys: ['path', 'summary', 'description', 'tags'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [endpoints]);

  const search = (query: string): NormalizedEndpoint[] => {
    if (!query.trim()) {
      return endpoints;
    }

    const results = fuse.search(query);
    return results.map((result) => result.item);
  };

  return { search };
}
