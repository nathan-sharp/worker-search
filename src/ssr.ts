import { Context } from 'hono';
import { wikipediaEngine } from './engines/wikipedia';
import { hackerNewsEngine } from './engines/hackernews';
import { SearchResult } from './types';

const ENGINES = [wikipediaEngine, hackerNewsEngine];

function escapeHTML(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const ssrSearchHandler = async (c: Context) => {
  const query = c.req.query('q');
  
  if (!query) {
    return c.redirect('/');
  }

  const promises = ENGINES.map(engine => engine.search(query, c.env));
  const resultsSettled = await Promise.allSettled(promises);

  let combinedResults: SearchResult[] = [];
  for (const result of resultsSettled) {
    if (result.status === 'fulfilled') {
      combinedResults = combinedResults.concat(result.value);
    }
  }

  const uniqueUrls = new Set<string>();
  const deduplicatedResults: SearchResult[] = [];
  for (const result of combinedResults) {
    const normalizedUrl = result.url.replace(/\/$/, '');
    if (!uniqueUrls.has(normalizedUrl)) {
      uniqueUrls.add(normalizedUrl);
      deduplicatedResults.push(result);
    }
  }

  const sorted = deduplicatedResults.sort(() => Math.random() - 0.5);

  let resultsHtml = '';
  for (const result of sorted) {
    const safeTitle = escapeHTML(result.title);
    const safeUrl = escapeHTML(result.url);
    const safeSnippet = escapeHTML(result.snippet);
    const safeSource = escapeHTML(result.source);
    
    resultsHtml += `
      <div class="result-card">
        <h2 class="result-title">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>
        </h2>
        <div class="result-snippet">${safeSnippet}</div>
        <div class="result-url">${safeUrl} <span class="result-source">- ${safeSource}</span></div>
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(query)} - Nexus Search</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="Nexus Meta Search">
</head>
<body class="has-searched">
  <main class="app-container">
    <header class="header">
      <h1 class="logo">
        <a href="/" style="text-decoration:none;">
          <span style="color:#0039b6">N</span><span style="color:#c41200">e</span><span style="color:#f3c518">x</span><span style="color:#0039b6">u</span><span style="color:#30a72f">s</span>
        </a>
      </h1>
      <div class="search-container">
        <form class="search-box" action="/search" method="GET">
          <input type="text" id="search-input" name="q" value="${escapeHTML(query)}" autocomplete="off" autofocus>
          <div class="search-buttons">
            <button type="submit" id="search-btn">Search</button>
          </div>
        </form>
      </div>
    </header>

    <div class="results-container">
      <p class="stats">Found ${sorted.length} results across multiple engines</p>
      <div class="results-list">
        ${resultsHtml}
      </div>
    </div>
  </main>
</body>
</html>`;

  return c.html(html);
};
