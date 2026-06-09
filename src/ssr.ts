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
  const pageStr = c.req.query('p');
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  
  if (!query) {
    return c.redirect('/');
  }

  const promises = ENGINES.map(engine => engine.search(query, page, c.env));
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

  let paginationHtml = '<div class="pagination">';
  for (let i = 1; i <= 10; i++) {
    if (i === page) {
      paginationHtml += `<span class="page-num current">${i}</span>`;
    } else {
      paginationHtml += `<a class="page-num" href="/search?q=${encodeURIComponent(query)}&p=${i}">${i}</a>`;
    }
  }
  if (page < 10) {
    paginationHtml += `<a class="page-num next" href="/search?q=${encodeURIComponent(query)}&p=${page + 1}">Next</a>`;
  }
  paginationHtml += '</div>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(query)} - Search</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="Web Search">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#x1F50D;</text></svg>">
</head>
<body class="has-searched">
  <main class="app-container">
    <header class="header">
      <h1 class="logo">
        <a href="/" style="text-decoration:none; color:black;">
          &#x1F50D;
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
      ${paginationHtml}
    </div>
  </main>

  <footer class="site-footer">
    Built by <a href="https://njs.dev" target="_blank" rel="noopener noreferrer">Nathan Sharp</a>
  </footer>
</body>
</html>`;

  return c.html(html);
};
