import { SearchEngine, SearchResult } from '../types';

export const wikipediaEngine: SearchEngine = {
  name: 'Wikipedia',
  async search(query: string, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://en.wikipedia.org/w/api.php');
      url.searchParams.set('action', 'opensearch');
      url.searchParams.set('search', query);
      url.searchParams.set('limit', '10');
      url.searchParams.set('namespace', '0');
      url.searchParams.set('format', 'json');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'CloudflareWorker-MetaSearch/1.0',
        },
      });

      if (!response.ok) return [];

      const data = await response.json() as [string, string[], string[], string[]];
      
      const titles = data[1] || [];
      const snippets = data[2] || [];
      const urls = data[3] || [];

      const results: SearchResult[] = [];
      for (let i = 0; i < titles.length; i++) {
        results.push({
          title: titles[i],
          snippet: snippets[i] || '',
          url: urls[i],
          source: 'Wikipedia',
        });
      }

      return results;
    } catch (e) {
      console.error('Wikipedia search error', e);
      return [];
    }
  },
};
