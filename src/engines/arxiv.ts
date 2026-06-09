import { SearchEngine, SearchResult } from '../types';

export const arxivEngine: SearchEngine = {
  name: 'arXiv',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('http://export.arxiv.org/api/query');
      url.searchParams.set('search_query', `all:${query}`);
      url.searchParams.set('start', ((page - 1) * 10).toString());
      url.searchParams.set('max_results', '10');

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'CloudflareWorker-MetaSearch/1.0' },
      });

      if (!response.ok) return [];

      const xml = await response.text();
      const results: SearchResult[] = [];
      
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      const titleRegex = /<title>([\s\S]*?)<\/title>/;
      const summaryRegex = /<summary>([\s\S]*?)<\/summary>/;
      const linkRegex = /<id>([\s\S]*?)<\/id>/;

      let match;
      while ((match = entryRegex.exec(xml)) !== null && results.length < 10) {
        const entryBlock = match[1];
        
        const titleMatch = titleRegex.exec(entryBlock);
        const summaryMatch = summaryRegex.exec(entryBlock);
        const linkMatch = linkRegex.exec(entryBlock);
        
        if (titleMatch && linkMatch) {
          results.push({
            url: linkMatch[1].trim(),
            title: titleMatch[1].replace(/(\r\n|\n|\r)/gm, " ").trim(),
            snippet: summaryMatch ? summaryMatch[1].replace(/(\r\n|\n|\r)/gm, " ").trim().substring(0, 200) + '...' : '',
            source: 'arXiv'
          });
        }
      }

      return results;
    } catch (e) {
      console.error('arXiv Error:', e);
      return [];
    }
  }
};
