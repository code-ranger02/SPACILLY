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
2. Attach policy **`SpacillyGitHubDeployPolicy`** (customer managed). Copy the complete JSON from [`SpacillyGitHubDeployPolicy.json`](./SpacillyGitHubDeployPolicy.json) when creating or editing the policy in IAM:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "STSIdentity",
      "Effect": "Allow",
      "Action": "sts:GetCallerIdentity",
      "Resource": "*"
    },
    {
      "Sid": "ElasticBeanstalkDeploy",
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:CreateStorageLocation",
        "elasticbeanstalk:DescribeApplications",
        "elasticbeanstalk:DescribeEnvironments",
        "elasticbeanstalk:DescribeEvents",
        "elasticbeanstalk:CreateApplicationVersion",
        "elasticbeanstalk:UpdateEnvironment",
        "elasticbeanstalk:DescribeApplicationVersions",
        "elasticbeanstalk:DescribeConfigurationSettings",
        "elasticbeanstalk:DescribeEnvironmentHealth",
        "elasticbeanstalk:DescribeEnvironmentResources",
        "elasticbeanstalk:DescribeInstancesHealth",
        "elasticbeanstalk:ListAvailableSolutionStacks",
        "elasticbeanstalk:ValidateConfigurationSettings",
        "elasticbeanstalk:RequestEnvironmentInfo",
        "elasticbeanstalk:RetrieveEnvironmentInfo",
        "elasticbeanstalk:AbortEnvironmentUpdate",
        "elasticbeanstalk:UpdateApplicationVersion"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ElasticBeanstalkArtifactBucket",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl",
        "s3:GetObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::elasticbeanstalk-eu-north-1-285407029888",
        "arn:aws:s3:::elasticbeanstalk-eu-north-1-285407029888/*"
      ]
    },
    {
      "Sid": "ElasticBeanstalkSupportingRead",
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackResources",
        "cloudformation:DescribeStackResource",
        "cloudformation:GetTemplate",
        "cloudformation:UpdateStack",
        "ec2:DescribeInstances",
        "ec2:DescribeImages",
        "ec2:DescribeLaunchTemplates",
        "ec2:DescribeLaunchTemplateVersions",
        "ec2:DescribeAvailabilityZones",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeVpcs",
        "ec2:DescribeKeyPairs",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeTargetHealth",
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:DescribeScalingActivities",
        "autoscaling:SuspendProcesses",
        "autoscaling:ResumeProcesses"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassRoleToElasticBeanstalk",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::285407029888:role/aws-elasticbeanstalk-service-role",
        "arn:aws:iam::285407029888:role/aws-elasticbeanstalk-ec2-role"
      ],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": [
            "elasticbeanstalk.amazonaws.com",
            "ec2.amazonaws.com"
          ]
        }
      }
    },
    {
      "Sid": "SNSElasticBeanstalkDeploy",
      "Effect": "Allow",
      "Action": "sns:CreateTopic",
      "Resource": "*"
    },
    {
      "Sid": "SNSElasticBeanstalkDeployTopicManagement",
      "Effect": "Allow",
      "Action": [
        "sns:GetTopicAttributes",
        "sns:SetTopicAttributes",
        "sns:Subscribe",
        "sns:ListSubscriptionsByTopic",
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:eu-north-1:285407029888:*"
    },
    {
      "Sid": "FrontendDeploy",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
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

**Required for full deploy completion:** `s3:GetObjectAcl`, SNS permissions, and EC2/ELB describe actions (including `ec2:DescribeImages`) on the GitHub deploy user. If EB still reports EC2 errors after updating this policy, also verify **`aws-elasticbeanstalk-service-role`** (see Troubleshooting).

3. **Security credentials** → **Create access key** → Application running outside AWS
4. Save **Access key ID** and **Secret access key** (shown once)

**Critical:** Attach **`SpacillyGitHubDeployPolicy`** to the **same IAM user whose access key is in GitHub secrets**. If logs show `user/github-actions-spacilly`, the policy must be on **`github-actions-spacilly`**, not only on `github-actions-spacilly-v2`.

On the IAM user, ensure **`AWSCompromisedKeyQuarantineV2` / `V3` is NOT attached**.

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
| EB deploy fails on `s3:GetObjectAcl` | Add `s3:GetObjectAcl` on EB bucket objects; confirm policy is on the GitHub IAM user (see error ARN) |
| EB deploy fails on SNS | Add SNS actions to policy; confirm user is `github-actions-spacilly` if that ARN appears in EB events |
| `Version: null` after upload | IAM user missing SNS + GetObjectAcl — update policy and attach to correct user, re-run workflow |
| `ec2:DescribeImages` during deploy | Add EC2/ELB describe actions to `SpacillyGitHubDeployPolicy`; verify `aws-elasticbeanstalk-service-role` has `AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy` or `AdministratorAccess-AWSElasticBeanstalk` |
| EB deploy fails permissions (general) | Update `SpacillyGitHubDeployPolicy` with full JSON in Step 1 |
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
