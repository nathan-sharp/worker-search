import { SearchEngine, SearchResult } from '../types';

export const stackOverflowEngine: SearchEngine = {
  name: 'Stack Overflow',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://api.stackexchange.com/2.3/search/advanced');
      url.searchParams.set('q', query);
      url.searchParams.set('site', 'stackoverflow');
      url.searchParams.set('pagesize', '10');
      url.searchParams.set('page', page.toString());
      url.searchParams.set('order', 'desc');
      url.searchParams.set('sort', 'relevance');

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'CloudflareWorker-MetaSearch/1.0' },
      });

      if (!response.ok) return [];

      const data = await response.json() as any;
      const items = data.items || [];

      const results: SearchResult[] = [];
      for (const item of items) {
        results.push({
          url: item.link,
          title: item.title,
          snippet: item.tags ? `Tags: ${item.tags.join(', ')}` : '',
          source: 'Stack Overflow'
        });
      }

      return results;
    } catch (e) {
      console.error('StackOverflow Error:', e);
      return [];
    }
  }
};
