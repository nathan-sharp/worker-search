document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const loader = document.getElementById('loader');
  const resultsContainer = document.getElementById('results-container');
  const resultsList = document.getElementById('results-list');
  const resultsStats = document.getElementById('results-stats');

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (!query) return;
    performSearch(query);
  });

  async function performSearch(query) {
    // Update URL without reloading the page
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('q', query);
    window.history.pushState({ path: newUrl.toString() }, '', newUrl.toString());

    // UI State updates
    document.body.classList.add('has-searched');
    resultsContainer.classList.add('hidden');
    loader.classList.remove('hidden');
    resultsList.innerHTML = '';

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      loader.classList.add('hidden');
      renderResults(data);
    } catch (error) {
      console.error(error);
      loader.classList.add('hidden');
      resultsStats.textContent = 'An error occurred while searching.';
      resultsContainer.classList.remove('hidden');
    }
  }

  function renderResults(data) {
    if (!data.results || data.results.length === 0) {
      resultsStats.textContent = `No results found for "${data.query}"`;
      resultsContainer.classList.remove('hidden');
      return;
    }

    resultsStats.textContent = `Found ${data.count} results across multiple engines`;
    
    // Sort results to interleave sources for a better meta search feel
    const sorted = data.results.sort(() => Math.random() - 0.5);

    sorted.forEach((result, index) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.animationDelay = `${index * 0.05}s`;

      const safeTitle = escapeHTML(result.title);
      const safeSnippet = escapeHTML(result.snippet);
      const safeUrl = escapeHTML(result.url);
      
      card.innerHTML = `
        <h2 class="result-title">
          <a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>
        </h2>
        <div class="result-snippet">${safeSnippet}</div>
        <div class="result-url">${safeUrl} <span class="result-source">- ${escapeHTML(result.source)}</span></div>
      `;
      
      resultsList.appendChild(card);
    });

    resultsContainer.classList.remove('hidden');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Check URL params on load
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q');
  if (q) {
    searchInput.value = q;
    performSearch(q);
  }
});
