import { SearchEngine, SearchResult } from '../types';

export const npmEngine: SearchEngine = {
  name: 'NPM',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://registry.npmjs.org/-/v1/search');
      url.searchParams.set('text', query);
      url.searchParams.set('size', '10');
      url.searchParams.set('from', ((page - 1) * 10).toString());

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'CloudflareWorker-MetaSearch/1.0' },
      });

      if (!response.ok) return [];

      const data = await response.json() as any;
      const objects = data.objects || [];

      const results: SearchResult[] = [];
      for (const obj of objects) {
        const pkg = obj.package;
        results.push({
          url: pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`,
          title: pkg.name,
          snippet: pkg.description || '',
          source: 'NPM'
        });
      }

      return results;
    } catch (e) {
      console.error('NPM Error:', e);
      return [];
    }
  }
};
