Welcome to Pokespace.

# Getting Started

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

The app runs on `http://localhost:3001` so it does not clash with the Nest API on port `3000`.

# Auth API

The frontend talks to `pokespace_backend` under `/api/v1`.

Locally, Vite proxies `/api/v1` to `API_URL` (default `http://localhost:3000`). On Vercel, a server route does the same proxy.

# Environment

| Variable          | Where         | Purpose                                                 |
| ----------------- | ------------- | ------------------------------------------------------- |
| `API_URL`         | server        | Nest origin, e.g. `http://localhost:3000`               |
| `VITE_API_URL`    | client        | Optional direct API base. Leave empty to use the proxy. |
| `VITE_SENTRY_DSN` | client/server | Sentry DSN                                              |
| `VITE_APP_TITLE`  | client        | Optional title                                          |

# Building For Production

```bash
pnpm build
```

Vercel should detect the TanStack Start / Nitro preset. Set `API_URL` to the deployed backend origin before going live.
