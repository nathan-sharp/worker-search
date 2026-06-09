import { SearchEngine, SearchResult } from '../types';
import { getSpoofedHeaders } from '../utils/headers';

export const braveEngine: SearchEngine = {
  name: 'Brave Search',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://search.brave.com/search');
      url.searchParams.set('q', query);
      if (page > 1) {
        url.searchParams.set('offset', (page - 1).toString());
      }

      const response = await fetch(url.toString(), {
        headers: getSpoofedHeaders(),
      });

      if (!response.ok) return [];

      const html = await response.text();
      const results: SearchResult[] = [];
      
      const regex = /<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<div class="title"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<div class="snippet-content"[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      
      while ((match = regex.exec(html)) !== null && results.length < 10) {
        if (match[1].startsWith('/')) continue;
        
        results.push({
          url: match[1],
          title: match[2].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          snippet: match[3].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          source: 'Brave Search'
        });
      }

      return results;
    } catch (e) {
      console.error('Brave Error:', e);
      return [];
    }
  }
};
