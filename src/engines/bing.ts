import { SearchEngine, SearchResult } from '../types';
import { getSpoofedHeaders } from '../utils/headers';

export const bingEngine: SearchEngine = {
  name: 'Bing',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      if (env?.BING_API_KEY) {
        const url = new URL('https://api.bing.microsoft.com/v7.0/search');
        url.searchParams.set('q', query);
        if (page > 1) {
          url.searchParams.set('offset', ((page - 1) * 10).toString());
        }

        const response = await fetch(url.toString(), {
          headers: { 'Ocp-Apim-Subscription-Key': env.BING_API_KEY }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json() as any;
        const items = data.webPages?.value || [];
        
        return items.map((item: any) => ({
          url: item.url,
          title: item.name,
          snippet: item.snippet,
          source: 'Bing (API)'
        }));
      }

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
