# Nexus Meta Search

Nexus is a blazing fast, serverless meta search engine powered by [Cloudflare Workers](https://workers.cloudflare.com/) and [Hono.js](https://hono.dev/). It aggregates results from multiple search engines (such as Wikipedia and Hacker News) in parallel and serves a premium, modern frontend interface directly from the edge.

## Features

- **Serverless Architecture**: Runs entirely on Cloudflare Workers, meaning near-zero latency and infinite scalability.
- **Parallel Aggregation**: Uses `Promise.allSettled` to query multiple external search APIs concurrently.
- **Native Static Assets**: Serves the frontend (HTML/CSS/JS) directly via Cloudflare Worker's native static asset routing.
- **Premium UI**: Modern dark mode interface featuring glassmorphism, dynamic animations, and sleek typography.

---

## Prerequisites

Before setting up the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.13.0 or later)
- npm (comes with Node.js)

---

## Setup Instructions

1. **Clone or Download the Repository**
   Navigate to the project directory:
   ```bash
   cd worker-search
   ```

2. **Install Dependencies**
   Install the required Node.js packages, including Hono and Wrangler (the Cloudflare Developer CLI):
   ```bash
   npm install
   ```

---

## Running the Local Test Environment

Cloudflare provides `Wrangler`, a CLI tool that simulates the Cloudflare Worker edge environment directly on your local machine.

To run the project locally:

1. **Start the Development Server**
   Run the following command in your terminal:
   ```bash
   npm run dev
   ```
   *(Windows Users: If you encounter a PowerShell execution policy error, use `npm.cmd run dev` instead).*

2. **Access the Search Engine**
   Once the server starts, you will see output indicating the server is ready.
   Open your browser and navigate to:
   ```
   http://127.0.0.1:8787
   ```

3. **Testing the API directly**
   You can also test the raw JSON output of the aggregator by hitting the API endpoint:
   ```
   http://127.0.0.1:8787/api/search?q=cloudflare
   ```

---

## Deployment

To deploy your meta search engine live to Cloudflare's global edge network:

1. Ensure you are logged into your Cloudflare account via Wrangler:
   ```bash
   npx wrangler login
   ```
   
2. Run the deployment script:
   ```bash
   npm run deploy
   ```
   Wrangler will bundle your code, upload your static assets, and provide you with a live `*.workers.dev` URL!

---

## Customizing Search Engines

To add or modify search sources:
1. Create a new adapter file in `src/engines/` (e.g., `src/engines/my-engine.ts`) conforming to the `SearchEngine` interface defined in `src/types.ts`.
2. Import and add your new engine to the `ENGINES` array inside `src/engines/aggregator.ts`.
