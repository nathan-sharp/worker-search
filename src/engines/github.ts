import { SearchEngine, SearchResult } from '../types';

export const githubEngine: SearchEngine = {
  name: 'GitHub',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://api.github.com/search/repositories');
      url.searchParams.set('q', query);
      url.searchParams.set('per_page', '10');
      url.searchParams.set('page', page.toString());

      const response = await fetch(url.toString(), {
        headers: { 
          'User-Agent': 'CloudflareWorker-MetaSearch/1.0',
          'Accept': 'application/vnd.github.v3+json'
        },
      });

      if (!response.ok) return [];

      const data = await response.json() as any;
      const items = data.items || [];

      const results: SearchResult[] = [];
      for (const item of items) {
        results.push({
          url: item.html_url,
          title: item.full_name,
          snippet: item.description || '',
          source: 'GitHub'
        });
      }

      return results;
    } catch (e) {
      console.error('GitHub Error:', e);
      return [];
    }
  }
};
