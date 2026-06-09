import { Hono } from 'hono';
import { searchHandler } from './engines/aggregator';
import { ssrSearchHandler } from './ssr';

// Cloudflare Workers entrypoint
const app = new Hono<{ Bindings: Env }>();

app.get('/api/search', searchHandler);
app.get('/search', ssrSearchHandler);

export default app;
