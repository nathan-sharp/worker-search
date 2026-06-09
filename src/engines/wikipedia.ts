import { SearchEngine, SearchResult } from '../types';

export const wikipediaEngine: SearchEngine = {
  name: 'Wikipedia',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://en.wikipedia.org/w/api.php');
      url.searchParams.set('action', 'query');
      url.searchParams.set('list', 'search');
      url.searchParams.set('srsearch', query);
      url.searchParams.set('utf8', '1');
      url.searchParams.set('format', 'json');
      url.searchParams.set('sroffset', ((page - 1) * 10).toString());
      url.searchParams.set('srlimit', '10');

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'CloudflareWorker-MetaSearch/1.0',
        },
      });

      if (!response.ok) return [];

      const data = await response.json() as any;
      const searchResults = data.query?.search || [];

      const results: SearchResult[] = [];
      for (const item of searchResults) {
        results.push({
          title: item.title,
          snippet: item.snippet.replace(/<\/?[^>]+(>|$)/g, ""), // strip html
          url: `https://en.wikipedia.org/?curid=${item.pageid}`,
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
