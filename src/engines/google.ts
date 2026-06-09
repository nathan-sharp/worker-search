import { SearchEngine, SearchResult } from '../types';
import { getBasicBrowserHeaders } from '../utils/headers';

export const googleEngine: SearchEngine = {
  name: 'Google',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      if (env?.GOOGLE_API_KEY && env?.GOOGLE_CX) {
        const url = new URL('https://customsearch.googleapis.com/customsearch/v1');
        url.searchParams.set('key', env.GOOGLE_API_KEY);
        url.searchParams.set('cx', env.GOOGLE_CX);
        url.searchParams.set('q', query);
        if (page > 1) {
          url.searchParams.set('start', (((page - 1) * 10) + 1).toString());
        }

        const response = await fetch(url.toString());
        if (!response.ok) return [];

        const data = await response.json() as any;
        const items = data.items || [];
        
        return items.map((item: any) => ({
          url: item.link,
          title: item.title,
          snippet: item.snippet,
          source: 'Google (API)'
        }));
      }

      const url = new URL('https://www.google.com/search');
      url.searchParams.set('q', query);
      if (page > 1) {
        url.searchParams.set('start', ((page - 1) * 10).toString());
      }

      const response = await fetch(url.toString(), {
        headers: getBasicBrowserHeaders(),
      });

      if (!response.ok) return [];

      const html = await response.text();
      const results: SearchResult[] = [];
      
      const regex = /<div class="kCrYT"><a href="\/url\?q=([^"&]+)[^"]*"><h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<div class="BNeawe[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      
      while ((match = regex.exec(html)) !== null && results.length < 10) {
        results.push({
          url: decodeURIComponent(match[1]),
          title: match[2].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          snippet: match[3].replace(/<\/?[^>]+(>|$)/g, "").trim(),
          source: 'Google'
        });
      }

      return results;
    } catch (e) {
      console.error('Google Error:', e);
      return [];
    }
  }
};
