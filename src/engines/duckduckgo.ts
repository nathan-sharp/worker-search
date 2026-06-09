import { SearchEngine, SearchResult } from '../types';
import { getSpoofedHeaders } from '../utils/headers';

export const duckduckgoEngine: SearchEngine = {
  name: 'DuckDuckGo',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://html.duckduckgo.com/html/');
      url.searchParams.set('q', query);
      if (page > 1) {
        url.searchParams.set('s', ((page - 1) * 30).toString());
      }

      const response = await fetch(url.toString(), {
        headers: getSpoofedHeaders(),
      });

      if (!response.ok) return [];

      const html = await response.text();
      const results: SearchResult[] = [];
      
      const regex = /<a class="result__url" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      
      while ((match = regex.exec(html)) !== null && results.length < 10) {
        let actualUrl = match[1];
        if (actualUrl.includes('uddg=')) {
          const urlObj = new URL('https:' + actualUrl);
          actualUrl = decodeURIComponent(urlObj.searchParams.get('uddg') || actualUrl);
        }

        results.push({
          url: actualUrl,
          title: match[2].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          snippet: match[3].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          source: 'DuckDuckGo'
        });
      }

      return results;
    } catch (e) {
      console.error('DDG Error:', e);
      return [];
    }
  }
};
