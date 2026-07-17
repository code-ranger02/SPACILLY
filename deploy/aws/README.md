# Spacilly API — AWS Elastic Beanstalk

Deploy the **API** from the `server/` directory. Deploy the **React client** separately (S3 + CloudFront, Amplify, or nginx on EC2).

## Prerequisites

- AWS account with Elastic Beanstalk access
- MongoDB Atlas cluster (`SpacillyDB`) with network access for your EB instances
- Environment properties set in EB (see `environment.properties.example`)

## 1. Environment properties

In **Elastic Beanstalk → your environment → Configuration → Software → Environment properties**, add every key from:

`deploy/aws/environment.properties.example`

Required minimum:

| Name | Example |
|------|---------|
| `MONGODB_URI` | `mongodb+srv://.../SpacillyDB?...` |
| `JWT_SECRET` | strong random string |
| `CLIENT_URL` | `https://www.spacilly.com` |
| `SERVER_URL` | `https://api.spacilly.com` (or EB URL) |
| `ALLOWED_ORIGINS` | comma-separated frontend origins |
| `NODE_ENV` | `production` |

EB sets `PORT` automatically (usually `8080`). The app reads `process.env.PORT`.

## 2. Deploy API to Elastic Beanstalk

```bash
cd server
npm install
npm run build
eb init -p "Node.js 20 running on 64bit Amazon Linux 2023" spacilly-api
eb create spacilly-api-prod
eb deploy
```

Or zip and upload via the EB console:

```bash
cd server
npm ci
npm run build
zip -r ../spacilly-api.zip . -x "node_modules/*" "uploads/*"
```

Upload `spacilly-api.zip` in the EB console. EB runs `npm install` and uses the Procfile start command.

## 3. Health check

Set EB health check path to:

```
/api/health
```

## 4. Deploy frontend (S3 + CloudFront or Amplify)

Build with your API URL baked in:

```bash
cd client
# Set at build time (Amplify env vars or local .env.production):
# VITE_API_URL=https://api.spacilly.com/api
# VITE_SERVER_URL=https://api.spacilly.com
npm ci
npm run build
```

Upload `client/dist/` to S3 and serve via CloudFront. Point `www.spacilly.com` to CloudFront.

For SEO bot rendering, use `deploy/seo/nginx.conf` or `cloudflare-worker.js` in front of both SPA and optional SEO SSR service.

## 5. DNS

| Record | Target |
|--------|--------|
| `api.spacilly.com` | EB environment URL (or ALB) |
| `www.spacilly.com` | CloudFront distribution |

## 6. Post-deploy checklist

- [ ] `GET https://api.spacilly.com/api/health` returns 200
- [ ] Google OAuth callback URL matches `GOOGLE_CALLBACK_URL`
- [ ] Payment webhooks/callbacks use `SERVER_URL` paths
- [ ] MongoDB Atlas IP allowlist includes EB security group / NAT egress
- [ ] CORS: `ALLOWED_ORIGINS` includes all frontend domains

## Files in this folder

| File | Purpose |
|------|---------|
| `environment.properties.example` | Copy into EB Environment properties |
| `.ebextensions/` | EB platform hooks (build + Node command) |
| `Procfile` | Symlink target — copy or deploy from `server/Procfile` |
