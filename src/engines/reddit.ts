import { SearchEngine, SearchResult } from '../types';

export const redditEngine: SearchEngine = {
  name: 'Reddit',
  async search(query: string, page: number, env: any): Promise<SearchResult[]> {
    try {
      const url = new URL('https://www.reddit.com/search.json');
      url.searchParams.set('q', query);
      url.searchParams.set('limit', '10');
      // Reddit uses 'after' token for pagination. For simple stateless page offsets, it's hard.
      // We will just return page 1 for now.
      if (page > 1) return [];

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'CloudflareWorker-MetaSearch/1.0' },
      });

      if (!response.ok) return [];

      const data = await response.json() as any;
      const children = data.data?.children || [];

      const results: SearchResult[] = [];
      for (const child of children) {
        const item = child.data;
        results.push({
          url: `https://www.reddit.com${item.permalink}`,
          title: item.title,
          snippet: (item.selftext || '').substring(0, 200),
          source: `Reddit - r/${item.subreddit}`
        });
      }

      return results;
    } catch (e) {
      console.error('Reddit Error:', e);
      return [];
    }
  }
};
