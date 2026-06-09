import { SearchEngine, SearchResult } from '../types';
import { getSpoofedHeaders } from '../utils/headers';

export const bingEngine: SearchEngine = {
  name: 'Bing',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://www.bing.com/search');
      url.searchParams.set('q', query);
      if (page > 1) {
        url.searchParams.set('first', (((page - 1) * 10) + 1).toString());
      }

      const response = await fetch(url.toString(), {
        headers: getSpoofedHeaders(),
      });

      if (!response.ok) return [];

      const html = await response.text();
      const results: SearchResult[] = [];
      
      const regex = /<li class="b_algo">[\s\S]*?<h2[^>]*><a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
      let match;
      
      while ((match = regex.exec(html)) !== null && results.length < 10) {
        results.push({
          url: match[1],
          title: match[2].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          snippet: match[3].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          source: 'Bing'
        });
      }

      return results;
    } catch (e) {
      console.error('Bing Error:', e);
      return [];
    }
  }
};
