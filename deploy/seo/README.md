# Spacilly SEO edge & deployment

Reverse-proxy and edge configurations for crawler-aware rendering (AWS CloudFront, Cloudflare, nginx).

## How it works

```
                ┌──────────────┐
                │  User Agent  │
                └──────┬───────┘
                       │
                       ▼
              ┌──────────────────┐
              │  Edge / CDN /    │   ← User-Agent sniff (bots vs humans)
              │  Worker / nginx  │
              └────┬────────┬────┘
       (human)     │        │  (bot / social crawler)
                   ▼        ▼
          ┌──────────────┐  ┌──────────────────────┐
          │  Vite SPA    │  │  seoSsrServer        │
          │  index.html  │  │  /, /products,       │
          └──────────────┘  │  /category/:slug     │
                            └──────────────────────┘
```

## Adapters

1. **`cloudflare-worker.js`** — Cloudflare Worker in front of CloudFront/S3 SPA + SEO SSR.
2. **`nginx.conf` / `Caddyfile`** — EC2, ALB, or nginx on Elastic Beanstalk.

Set `SEO_SSR_ORIGIN` at the edge to proxy bot traffic to the SEO SSR service.

## Environment

| Variable | Where | Purpose |
|----------|-------|---------|
| `SEO_SSR_ORIGIN` | Edge (Worker/nginx/CloudFront) | Where to proxy bot traffic |
| `SEO_SSR_DISABLE` | Edge | Set to `1` to bypass SSR |
| `SEO_PUBLIC_BASE_URL` | SEO SSR server | Canonical origin in `<link rel="canonical">` |
| `API_ORIGIN` | SEO SSR server | Fetches product / category data |
| `MEDIA_ORIGIN` | SEO SSR server | Absolute image URLs |
| `VITE_SITE_ORIGIN` | SPA build | Canonical site origin for client `<head>` |

## Smoke-test

```bash
curl -sI https://www.spacilly.com/product/example-slug
curl -sI -A "Googlebot" https://www.spacilly.com/product/example-slug
```
