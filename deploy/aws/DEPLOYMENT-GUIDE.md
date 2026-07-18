# Spacilly — Complete AWS Deployment Guide (No Custom Domain)

Deploy **API** on Elastic Beanstalk and **React frontend** on S3 + CloudFront.  
Use AWS default URLs (`*.elasticbeanstalk.com`, `*.cloudfront.net`) until you buy a domain.

**Estimated time:** 2–4 hours first time.

---

## Architecture (no domain)

```
Browser
   │
   ├─► https://d111.cloudfront.net          ← React SPA (S3 + CloudFront)
   │
   └─► https://d222.cloudfront.net/api/...  ← API (CloudFront → Elastic Beanstalk)
              │
              └─► EB EC2 (Node.js) ──► MongoDB Atlas (external)
```

Why two CloudFront distributions?

- Frontend must be **HTTPS** (CloudFront provides SSL on `*.cloudfront.net`).
- EB default URL is **HTTP only** without a custom domain + ACM certificate.
- Putting CloudFront in front of EB gives you **HTTPS for the API** without buying a domain.

---

## Phase 0 — Prerequisites

### Accounts & tools

| Item | Action |
|------|--------|
| AWS account | https://aws.amazon.com — enable billing |
| MongoDB Atlas | Cluster `SpacillyDB` running, connection string ready |
| Git | Repo cloned at `D:\E-COMMERCE` |
| Node.js 20+ | `node --version` |
| AWS CLI (optional) | `winget install Amazon.AWSCLI` |

### External services (keep using these — not on AWS)

- MongoDB Atlas (`MONGODB_URI`)
- Cloudinary (images)
- Resend or SMTP (email)
- Stripe / Flutterwave / MoMo (payments)
- Google OAuth (Google Cloud Console)
- Gemini API (AI assistant)

---

## Phase 1 — IAM Setup

### 1.1 Elastic Beanstalk service role (AWS creates this automatically)

When you create your first EB environment, AWS offers to create:

- **aws-elasticbeanstalk-service-role** — EB service uses this
- **aws-elasticbeanstalk-ec2-role** — EC2 instances use this

Click **Create role** if prompted. If they already exist, reuse them.

### 1.2 EC2 instance profile permissions

1. AWS Console → **IAM** → **Roles**
2. Open **aws-elasticbeanstalk-ec2-role**
3. Attached policies should include at minimum:
   - `AWSElasticBeanstalkWebTier`
   - `AWSElasticBeanstalkMulticontainerDocker`
   - `AWSElasticBeanstalkWorkerTier`

For basic Spacilly API, the default EB EC2 role is sufficient.

### 1.3 Your deploy user (optional but recommended)

Create an IAM user `spacilly-deploy` for yourself (not root):

1. IAM → **Users** → **Create user** → `spacilly-deploy`
2. Attach policies:
   - `AWSElasticBeanstalkFullAccess`
   - `AmazonS3FullAccess` (or scoped to your bucket)
   - `CloudFrontFullAccess`
3. Create **Access key** → save for AWS CLI

Never commit access keys to Git.

---

## Phase 2 — MongoDB Atlas (allow AWS traffic)

EB instances get dynamic IPs. Easiest approach for first deploy:

1. MongoDB Atlas → **Network Access** → **Add IP Address**
2. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) temporarily
3. After EB is running, you can restrict to the EB security group NAT IP (optional, advanced)

Confirm database user `spacilly` has **readWrite** on `SpacillyDB`.

---

## Phase 3 — Deploy API to Elastic Beanstalk (first time only)

Use a one-time manual upload to create the environment. **All later deploys use GitHub Actions** (Phase 3B).

### 3.1 Package the server (first deploy only)

In **Command Prompt**:

```bat
cd /d D:\E-COMMERCE\deploy\aws
package-api.bat
```

This creates `deploy\aws\spacilly-api.zip`.

> **Note:** EB will run `npm install` on the server. The zip excludes `node_modules`.

### 3.2 Create EB application

1. AWS Console → **Elastic Beanstalk** → **Create application**
2. **Application name:** `spacilly-api`
3. **Platform:** Node.js
4. **Platform branch:** Node.js 20 running on 64bit Amazon Linux 2023
5. **Application code:** Upload `spacilly-api.zip`
6. **Preset:** Single instance (free tier) or High availability (production)
7. Click **Next**

### 3.3 Configure service access

- **Service role:** `aws-elasticbeanstalk-service-role` (create if needed)
- **EC2 instance profile:** `aws-elasticbeanstalk-ec2-role` (create if needed)
- Click **Next** through remaining steps → **Submit**

Wait 5–10 minutes until health is **Ok** (may fail first time until env vars are set — that's normal).

### 3.4 Copy your EB URL

EB → **Environments** → `spacilly-api-prod` → top banner URL:

```
http://spacilly-api-prod.eba-XXXXXXXX.us-east-1.elasticbeanstalk.com
```

Save this as `EB_URL`. Test:

```bat
curl http://spacilly-api-prod.eba-XXXXXXXX.us-east-1.elasticbeanstalk.com/api/health
```

---

## Phase 3B — GitHub Actions (automatic deploy)

After the EB environment exists, configure CI/CD so every push to `master` deploys automatically.

**Full setup:** [`GITHUB-ACTIONS-SETUP.md`](./GITHUB-ACTIONS-SETUP.md)

### Workflows in this repo

| File | Deploys |
|------|---------|
| `.github/workflows/backend-deploy.yml` | `server/` → Elastic Beanstalk |
| `.github/workflows/frontend-deploy.yml` | `client/` → S3 + CloudFront |

### GitHub secrets (backend — add now)

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret |
| `AWS_REGION` | e.g. `us-east-1` |
| `EB_APPLICATION_NAME` | `spacilly-api` |
| `EB_ENVIRONMENT_NAME` | `spacilly-api-prod` |
| `EB_ENVIRONMENT_URL` | Your EB URL (optional health check) |

### Push to deploy

```bash
git push origin master
```

GitHub → **Actions** → watch **Deploy Backend (Elastic Beanstalk)**.

> Runtime secrets (`MONGODB_URI`, `JWT_SECRET`, etc.) stay in **EB Environment properties**, not GitHub.

---

## Phase 4 — Environment properties (EB)

EB → **Configuration** → **Software** → **Edit** → **Environment properties**

Add every key below. Use `environment.properties.no-domain.example` as reference.

### Required (minimum to boot)

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `CLIENT_URL` | Set after Phase 6 (frontend CloudFront URL) |
| `SERVER_URL` | Set after Phase 5 (API CloudFront URL) |
| `ALLOWED_ORIGINS` | Same as `CLIENT_URL` |

**First deploy trick:** Set temporary values, then update after CloudFront is created:

```
CLIENT_URL=http://localhost
SERVER_URL=http://spacilly-api-prod.eba-XXXXXXXX.us-east-1.elasticbeanstalk.com
ALLOWED_ORIGINS=http://localhost
```

After frontend CloudFront exists, update all three to HTTPS CloudFront URLs.

### Auth & OAuth

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://YOUR_API_CLOUDFRONT.cloudfront.net/api/auth/google/callback` |

Update Google Cloud Console → OAuth → Authorized redirect URIs when API CloudFront URL is known.

### Email

| Name | Value |
|------|-------|
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | Your key |
| `RESEND_FROM_EMAIL` | Verified sender |

### Cloudinary, AI, Payments

Copy remaining keys from your local `server/env` into EB Environment properties.  
See `deploy/aws/environment.properties.no-domain.example` for the full list.

Click **Apply** — EB will restart (2–5 min).

Verify:

```bat
curl http://EB_URL/api/health
```

Expected: JSON with status OK / 200.

---

## Phase 5 — HTTPS for API (CloudFront → EB)

### 5.1 Create API CloudFront distribution

1. **CloudFront** → **Create distribution**
2. **Origin domain:** paste your EB URL **without** `http://`  
   Example: `spacilly-api-prod.eba-XXXXXXXX.us-east-1.elasticbeanstalk.com`
3. **Protocol:** HTTP only (EB origin)
4. **Origin path:** leave empty
5. **Viewer protocol policy:** Redirect HTTP to HTTPS
6. **Allowed methods:** GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
7. **Cache policy:** `CachingDisabled` (required for dynamic API + WebSockets headers)
8. **Origin request policy:** `AllViewer` (forwards all headers/cookies/query strings)
9. Create distribution

Save the domain:

```
https://d2222222222222.cloudfront.net   ← API_CLOUDFRONT_URL
```

### 5.2 WebSocket note

Socket.IO may need sticky sessions. For first deploy, test basic REST API first.  
If WebSockets fail through CloudFront, consider enabling ALB stickiness on EB or direct EB URL for dev testing.

### 5.3 Update EB environment properties

| Name | Value |
|------|-------|
| `SERVER_URL` | `https://d2222222222222.cloudfront.net` |
| `GOOGLE_CALLBACK_URL` | `https://d2222222222222.cloudfront.net/api/auth/google/callback` |
| `MOMO_CALLBACK_URL` | `https://d2222222222222.cloudfront.net/api/payments/momo/callback` |

Apply and wait for restart.

Test:

```bat
curl https://d2222222222222.cloudfront.net/api/health
```

---

## Phase 6 — Deploy frontend (S3 + CloudFront)

### 6.1 Build React app with production API URL

Create `client\.env.production`:

```
VITE_API_URL=https://d2222222222222.cloudfront.net/api
VITE_SERVER_URL=https://d2222222222222.cloudfront.net
```

Build:

```bat
cd /d D:\E-COMMERCE\client
npm ci
npm run build
```

Output: `client\dist\`

### 6.2 Create S3 bucket

1. **S3** → **Create bucket**
2. **Name:** `spacilly-frontend-prod` (globally unique)
3. **Region:** same as EB (e.g. `us-east-1`)
4. **Block all public access:** ON (CloudFront will access via OAC)
5. Create bucket

### 6.3 Upload build

1. Open bucket → **Upload**
2. Upload **all files inside** `client\dist\` (including `index.html`, `assets/`)
3. Upload

### 6.4 Create frontend CloudFront distribution

1. **CloudFront** → **Create distribution**
2. **Origin:** S3 bucket `spacilly-frontend-prod`
3. **Origin access:** Origin access control (OAC) → Create new OAC
4. Copy the S3 bucket policy CloudFront suggests → paste in S3 bucket **Permissions** → **Bucket policy**
5. **Viewer protocol policy:** Redirect HTTP to HTTPS
6. **Default root object:** `index.html`
7. **Error pages** (SPA routing):
   - HTTP 403 → `/index.html` → 200
   - HTTP 404 → `/index.html` → 200
8. Create distribution

Save:

```
https://d1111111111111.cloudfront.net   ← FRONTEND_CLOUDFRONT_URL
```

Wait until **Deployed** status (5–15 min).

### 6.5 Update EB environment properties (CORS)

| Name | Value |
|------|-------|
| `CLIENT_URL` | `https://d1111111111111.cloudfront.net` |
| `ALLOWED_ORIGINS` | `https://d1111111111111.cloudfront.net` |

Apply → EB restarts.

### 6.6 Update Google OAuth

Google Cloud Console → OAuth client → **Authorized JavaScript origins:**

```
https://d1111111111111.cloudfront.net
```

**Authorized redirect URIs** (already set):

```
https://d2222222222222.cloudfront.net/api/auth/google/callback
```

---

## Phase 7 — Security groups (if API unreachable)

If CloudFront → EB returns 502/504:

1. EB → **Configuration** → **Instances** → EC2 security group
2. **Inbound rules** → Add:
   - Type: HTTP, Port: 80, Source: `0.0.0.0/0` (or CloudFront managed prefix list)
3. Apply

Default EB setup usually allows this already.

---

## Phase 8 — Final verification checklist

| Test | Command / Action | Expected |
|------|------------------|----------|
| API health | `curl https://API_CLOUDFRONT/api/health` | 200 JSON |
| Frontend loads | Open `FRONTEND_CLOUDFRONT` in browser | Spacilly homepage |
| Login | Try email login | No CORS errors in DevTools |
| Google OAuth | Click Google sign-in | Redirect works |
| MongoDB | Create account / browse products | Data loads |
| Image upload | Seller product image | Cloudinary upload works |
| Payments | Test checkout (sandbox) | Callback hits `MOMO_CALLBACK_URL` |

Open browser DevTools → **Network** tab. All API calls should go to `https://d222...cloudfront.net/api/...` with no mixed-content errors.

---

## Phase 9 — Deploy updates (GitHub Actions)

### API update

Push changes under `server/` to `master`:

```bash
git push origin master
```

Or: GitHub → **Actions** → **Deploy Backend** → **Run workflow**.

### Frontend update

Push changes under `client/` to `master` (requires S3 + CloudFront secrets — see `GITHUB-ACTIONS-SETUP.md`).

### Manual fallback (optional)

```bat
cd /d D:\E-COMMERCE\deploy\aws
package-api.bat
```

EB Console → **Upload and deploy** → `spacilly-api.zip`

**Frontend manual fallback:** `npm run build` in `client/`, upload `dist/` to S3, invalidate CloudFront `/*`.

---

## Phase 10 — When you buy a domain later

1. **Route 53** or your registrar → create hosted zone
2. **ACM** (us-east-1 for CloudFront) → request cert for `spacilly.com`, `www.spacilly.com`, `api.spacilly.com`
3. CloudFront → add **Alternate domain names (CNAMEs)** + attach ACM cert
4. DNS:
   - `www.spacilly.com` → frontend CloudFront
   - `api.spacilly.com` → API CloudFront
5. Update EB Environment properties:
   - `CLIENT_URL=https://www.spacilly.com`
   - `SERVER_URL=https://api.spacilly.com`
   - `ALLOWED_ORIGINS=https://www.spacilly.com,https://spacilly.com`
6. Rebuild frontend with new `VITE_API_URL` / `VITE_SERVER_URL`
7. Update Google OAuth redirect URIs

No code architecture changes needed — only env vars and DNS.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| EB health Red | EB → Logs → Request logs / Last 100 lines |
| `MONGODB_URI` connection failed | Atlas Network Access → allow `0.0.0.0/0` |
| CORS error in browser | `ALLOWED_ORIGINS` must exactly match frontend URL (https, no trailing slash) |
| 502 from CloudFront | EB security group, EB health, origin domain correct |
| Google OAuth redirect mismatch | `GOOGLE_CALLBACK_URL` must match Google Console exactly |
| Blank page on refresh | CloudFront error pages → 403/404 → `/index.html` 200 |
| Env var not applied | EB Configuration → Apply → wait for green health |

---

## File reference in this repo

| File | Purpose |
|------|---------|
| `server/.ebextensions/01_node.config` | EB build + health check |
| `server/Procfile` | Start command |
| `deploy/aws/environment.properties.no-domain.example` | Env vars without domain |
| `deploy/aws/package-api.bat` | Windows zip for EB upload |
| `client/.env.example` | Frontend build-time vars |

---

## Cost estimate (no domain, minimal traffic)

| Service | Approx. monthly |
|---------|-----------------|
| EB single instance (t3.micro) | ~$8–15 |
| 2× CloudFront distributions | ~$1–5 |
| S3 | < $1 |
| MongoDB Atlas (free M0) | $0 |
| **Total** | ~$10–25 |

Use **AWS Free Tier** where eligible for first 12 months.
