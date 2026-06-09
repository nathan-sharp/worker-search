export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface SearchEngine {
  name: string;
  search(query: string, page: number, env: any): Promise<SearchResult[]>;
}
