import { Context } from 'hono';
import { wikipediaEngine } from './wikipedia';
import { hackerNewsEngine } from './hackernews';
import { duckduckgoEngine } from './duckduckgo';
import { googleEngine } from './google';
import { bingEngine } from './bing';
import { redditEngine } from './reddit';
import { githubEngine } from './github';
import { stackOverflowEngine } from './stackoverflow';
import { arxivEngine } from './arxiv';
import { npmEngine } from './npm';
import { braveEngine } from './brave';
import { SearchResult } from '../types';

const ENGINES = [
  wikipediaEngine, hackerNewsEngine, duckduckgoEngine, 
  googleEngine, bingEngine, redditEngine, githubEngine, 
  stackOverflowEngine, arxivEngine, npmEngine, braveEngine
];

export const searchHandler = async (c: Context) => {
  const query = c.req.query('q');
  const pageStr = c.req.query('p');
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  
  if (!query) {
    return c.json({ error: 'Missing query parameter "q"' }, 400);
  }

  // Create an array of promises for each engine
  const promises = ENGINES.map(engine => engine.search(query, page, c.env));

  // Run all engines in parallel
  const results = await Promise.allSettled(promises);

  let combinedResults: SearchResult[] = [];

  // Gather results
  for (const result of results) {
    if (result.status === 'fulfilled') {
      combinedResults = combinedResults.concat(result.value);
    } else {
      console.error('Engine failed:', result.reason);
    }
  }

  // Simple deduplication based on URL
  const uniqueUrls = new Set<string>();
  const deduplicatedResults: SearchResult[] = [];

  for (const result of combinedResults) {
    // Normalize URL for deduplication (strip trailing slash)
    const normalizedUrl = result.url.replace(/\/$/, '');
    if (!uniqueUrls.has(normalizedUrl)) {
      uniqueUrls.add(normalizedUrl);
      deduplicatedResults.push(result);
    }
  }

  // Return JSON response
  return c.json({
    query,
    count: deduplicatedResults.length,
    results: deduplicatedResults,
  });
};
