import { SearchEngine, SearchResult } from '../types';
import { getBasicBrowserHeaders } from '../utils/headers';

export const googleEngine: SearchEngine = {
  name: 'Google',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
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
