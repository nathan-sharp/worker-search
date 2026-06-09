import { SearchEngine, SearchResult } from '../types';

export const hackerNewsEngine: SearchEngine = {
  name: 'Hacker News',
  async search(query: string, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://hn.algolia.com/api/v1/search');
      url.searchParams.set('query', query);
      url.searchParams.set('hitsPerPage', '10');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'CloudflareWorker-MetaSearch/1.0',
        },
      });

      if (!response.ok) return [];

      const data = await response.json() as any;
      
      const results: SearchResult[] = [];
      for (const hit of data.hits || []) {
        if (!hit.url) continue;
        results.push({
          title: hit.title || hit.story_title || 'No Title',
          snippet: hit.story_text ? hit.story_text.substring(0, 200) : '',
          url: hit.url,
          source: 'Hacker News',
        });
      }

      return results;
    } catch (e) {
      console.error('Hacker News search error', e);
      return [];
    }
  },
};
