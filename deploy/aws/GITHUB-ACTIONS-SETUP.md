# GitHub Actions → AWS (Elastic Beanstalk + S3 + CloudFront)

Automatic deployment on every push to `master`:

| Workflow | Triggers on | Deploys |
|----------|-------------|---------|
| `backend-deploy.yml` | Changes in `server/` | Elastic Beanstalk `spacilly-api-prod` |
| `frontend-deploy.yml` | Changes in `client/` | S3 bucket + CloudFront invalidation |

Manual deploy: GitHub → **Actions** → select workflow → **Run workflow**.

---

## Step 1 — IAM user for GitHub Actions

1. IAM → **Users** → **Create user** → `github-actions-spacilly`
2. Attach policy (create inline policy `SpacillyGitHubDeploy`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ElasticBeanstalkDeploy",
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:*",
        "ec2:DescribeInstances",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeVpcs",
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:SuspendProcesses",
        "autoscaling:ResumeProcesses",
        "cloudformation:DescribeStackResource",
        "cloudformation:DescribeStackResources",
        "cloudformation:DescribeStacks",
        "cloudformation:GetTemplate",
        "cloudformation:UpdateStack",
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:CreateBucket"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

3. **Security credentials** → **Create access key** → Application running outside AWS
4. Save **Access key ID** and **Secret access key** (shown once)

**Critical:** On the IAM user, ensure **`AWSCompromisedKeyQuarantineV2` is NOT attached**. That managed policy adds explicit `Deny` on S3 uploads and causes `403` with an empty message when deploying to `elasticbeanstalk-*` buckets.

If deploy packages exceed ~7 MB, the IAM user also needs `s3:ListBucketMultipartUploads`, `s3:ListMultipartUploadParts`, and `s3:AbortMultipartUpload` on the EB artifact bucket (included in the policy above and in `AdministratorAccess`).

---

## Step 2 — GitHub repository secrets

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required for backend deploy (add now)

| Secret | Example value | Notes |
|--------|---------------|-------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | From IAM user |
| `AWS_SECRET_ACCESS_KEY` | `...` | From IAM user |
| `AWS_REGION` | `eu-north-1` | Same region as EB |
| `EB_APPLICATION_NAME` | `spacilly-api` | EB application name |
| `EB_ENVIRONMENT_NAME` | `spacilly-api-prod` | EB environment name |
| `EB_S3_BUCKET` | `elasticbeanstalk-eu-north-1-285407029888` | Optional; auto-detected if omitted |
| `EB_ENVIRONMENT_URL` | `http://spacilly-api.eu-north-1.elasticbeanstalk.com` | Health check + docs |

### Required for frontend deploy (add when S3 + CloudFront exist)

| Secret | Example value |
|--------|---------------|
| `S3_FRONTEND_BUCKET` | `spacilly-frontend-prod` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1234567890ABC` |
| `VITE_API_URL` | `https://d222.cloudfront.net/api` or EB URL + `/api` |
| `VITE_SERVER_URL` | `https://d222.cloudfront.net` |
| `VITE_SITE_ORIGIN` | `https://d111.cloudfront.net` |
| `VITE_WORKOS_CLIENT_ID` | (optional) |

> **Do not** put `MONGODB_URI`, `JWT_SECRET`, or payment keys in GitHub secrets for the app runtime — those belong in **EB Environment properties** only.

---

## Step 3 — EB environment variables (runtime)

Set once in AWS Console (not in GitHub):

**Elastic Beanstalk** → **spacilly-api-prod** → **Configuration** → **Software** → **Environment properties**

Use `deploy/aws/environment.properties.no-domain.example` as the full list.

Minimum to run:

```
NODE_ENV=production
HOST=0.0.0.0
MONGODB_URI=...
JWT_SECRET=...
SERVER_URL=http://spacilly-api-prod.eba-xxxxx.us-east-1.elasticbeanstalk.com
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

Update `CLIENT_URL` / `ALLOWED_ORIGINS` after frontend CloudFront is live.

---

## Step 4 — Push to trigger deploy

```bash
git add .github/workflows/
git commit -m "ci: add GitHub Actions deploy to Elastic Beanstalk and S3"
git push origin master
```

Watch: GitHub → **Actions** → **Deploy Backend (Elastic Beanstalk)**

---

## How backend deploy works

1. Checkout `server/`
2. `npm ci` + `npm run build` (fail fast if TypeScript/build breaks)
3. Zip server (excludes `node_modules`, `uploads`, `.env`)
4. Upload version to EB via `einaregilsson/beanstalk-deploy`
5. EB runs `npm install` on instance + `.ebextensions` build step
6. Optional curl `/api/health` on `EB_ENVIRONMENT_URL`

---

## How frontend deploy works

1. Skip if `S3_FRONTEND_BUCKET` or `CLOUDFRONT_DISTRIBUTION_ID` missing
2. Write `client/.env.production` from secrets
3. `npm ci` + `npm run build`
4. `aws s3 sync client/dist/` with long cache for assets, no-cache for HTML
5. CloudFront invalidation `/*`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing EB_APPLICATION_NAME` | Add GitHub secret |
| EB deploy fails permissions | Check IAM policy includes `elasticbeanstalk:*` and S3 for EB bucket |
| Health check fails | Set `EB_ENVIRONMENT_URL`; verify env vars in EB |
| Frontend skipped | Add S3 + CloudFront secrets |
| CORS errors after frontend deploy | Update EB `CLIENT_URL` and `ALLOWED_ORIGINS` to CloudFront URL |
| Build fails on EB | Check EB logs: Logs → Request logs / Last 100 lines |

---

## Branch name

Workflows trigger on `master`. If your default branch is `main`, edit both workflow files:

```yaml
branches:
  - main
```
