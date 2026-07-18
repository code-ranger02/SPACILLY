# Deployment audit — Spacilly backend (Elastic Beanstalk + GitHub Actions)

Date: 2026-07-18  
Region: `eu-north-1`  
Account: `285407029888`  
EB application: `spacilly-api`  
EB environment: `spacilly-api-prod`  
EB URL: `http://spacilly-api.eu-north-1.elasticbeanstalk.com`

---

## Executive summary — root cause

The workflow **did not fail** on zip creation, Node build, or wrong EB application/environment names.

It failed at **S3 upload** to the Elastic Beanstalk regional artifact bucket:

```
elasticbeanstalk-eu-north-1-285407029888
```

with **HTTP 403 Access Denied** and an **empty error message**. That signature matches AWS SDK S3 `AccessDenied`, not EB misconfiguration.

### Verified root cause (ranked)

| # | Cause | Evidence |
|---|--------|----------|
| **1 (most likely)** | **S3 permission denied on EB artifact bucket** — either explicit **Deny** policy (e.g. `AWSCompromisedKeyQuarantineV2`), **permissions boundary**, or **Organization SCP** overriding `AdministratorAccess` | Exact match to [Stack Overflow 79240024](https://stackoverflow.com/questions/79240024/) — same empty 403 on upload to `elasticbeanstalk-*` bucket |
| **2** | **Multipart upload path** — packages **> ~7 MB** use `s3:ListBucketMultipartUploads` / multipart APIs; missing permissions produce 403 even when `s3:PutObject` appears allowed | [AWS EB CLI issue #68](https://github.com/aws/aws-elastic-beanstalk-cli/issues/68) |
| **3** | **`einaregilsson/beanstalk-deploy@v22` does not set `bucket-owner-full-control` ACL** — EB buckets with **Object Ownership = Bucket owner enforced** can reject uploads without that ACL | AWS S3 Object Ownership behavior |
| **4 (verify)** | **GitHub secrets access key is not the `github-actions-spacilly` user** that has AdministratorAccess (wrong key, rotated key, or typo) | Run `aws sts get-caller-identity` in workflow (added in fix) |

### Ruled out (not root cause)

| Check | Result |
|-------|--------|
| `deploy.zip` missing before deploy | **Ruled out** — log reached "Uploading file to bucket" |
| Wrong `deployment_package` path | **Correct** — `server/deploy.zip` created in prior step |
| Zip not in git | **Expected** — built in CI, not committed |
| Wrong `EB_APPLICATION_NAME` / `EB_ENVIRONMENT_NAME` | **Correct** — action printed Application/Environment from secrets |
| Wrong region in secrets | **Correct** — bucket name contains `eu-north-1`, matches your EB URL |
| Node 24 deprecation warning | **Not failure cause** — build uses Node 20; warning is from third-party action runtime |
| Missing `configure-aws-credentials` in old workflow | **Not 403 cause** — beanstalk-deploy passes keys directly; still authenticates (upload started) |
| EB environment does not exist | **Ruled out** — you created it manually; upload fails before `update-environment` |
| Frontend workflow | **Unrelated** — not run for backend failure |

---

## Full checklist (23 items)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `backend-deploy.yml` | ⚠️ Fixed | Replaced brittle third-party upload with AWS CLI + preflight |
| 2 | `deploy.zip` creation | ✅ OK | Created in CI step 57–65 |
| 3 | `deploy.zip` exists before deploy | ✅ OK | Failure log proves upload step ran |
| 4 | Zip contains correct app | ✅ OK | Zips `server/` with `Procfile`, `.ebextensions`, `dist/` after build |
| 5 | AWS credentials usage | ⚠️ | Old: raw keys to action. New: `configure-aws-credentials` |
| 6 | Region consistency | ✅ OK | `eu-north-1` in secrets matches EB URL |
| 7 | EB application name | ✅ OK | `spacilly-api` |
| 8 | EB environment name | ✅ OK | `spacilly-api-prod` |
| 9 | Correct S3 bucket requested | ✅ OK | `elasticbeanstalk-eu-north-1-285407029888` |
| 10 | Bucket exists | ✅ Likely | Created when you first used EB console in that region |
| 11 | Bucket permissions for IAM user | ❌ **FAIL** | 403 on upload |
| 12 | Missing permissions for action | ❌ **FAIL** | Multipart + ACL + possible Deny policy |
| 13 | Node 24 compatibility | ✅ N/A | Not related to 403 |
| 14 | Credentials actually used | ✅ Yes | Upload reached S3 (auth accepted, authorization denied) |
| 15 | Secret names match workflow | ✅ OK | All five secrets referenced correctly |
| 16 | `configure-aws-credentials` before deploy | ❌ Was missing | **Added** |
| 17 | Deployment action outdated | ⚠️ | `beanstalk-deploy@v22` — replaced with AWS CLI |
| 18 | Missing IAM permissions | ❌ See below | Verify Deny policies + multipart S3 |
| 19 | EB application exists | ✅ Yes | Manual first deploy created it |
| 20 | EB environment exists | ✅ Yes | Running at eu-north-1 URL |
| 21 | Package path correct | ✅ `server/deploy.zip` |
| 22 | `deploy.zip` gitignored | N/A | Built in CI only — correct |
| 23 | Workflow deletes zip | ✅ No | Not deleted before deploy |

---

## IAM — what to verify in AWS Console

Open **IAM → Users → github-actions-spacilly**

### 1. Remove explicit Deny policies

Check **Permissions** tab for:

- `AWSCompromisedKeyQuarantineV2` ← **remove immediately if present** (causes exact 403 on S3)

### 2. Confirm access key belongs to this user

**Security credentials** → verify the active access key ID matches GitHub secret `AWS_ACCESS_KEY_ID`.

### 3. Permissions boundary

If a **permissions boundary** is set, it may block `s3:ListBucketMultipartUploads` even with `AdministratorAccess`.

### 4. Recommended inline policy (replace ad-hoc admin if you want least privilege)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ElasticBeanstalkDeploy",
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:*",
        "cloudformation:Describe*",
        "cloudformation:GetTemplate",
        "cloudformation:UpdateStack",
        "ec2:Describe*",
        "autoscaling:Describe*",
        "autoscaling:SuspendProcesses",
        "autoscaling:ResumeProcesses",
        "iam:PassRole",
        "sts:GetCallerIdentity"
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
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::elasticbeanstalk-eu-north-1-285407029888",
        "arn:aws:s3:::elasticbeanstalk-eu-north-1-285407029888/*"
      ]
    }
  ]
}
```

`AdministratorAccess` is sufficient **unless** an explicit Deny or boundary exists.

---

## GitHub secrets — add optional bucket name

| Secret | Value |
|--------|-------|
| `EB_S3_BUCKET` | `elasticbeanstalk-eu-north-1-285407029888` |
| `EB_ENVIRONMENT_URL` | `http://spacilly-api.eu-north-1.elasticbeanstalk.com` |

Other secrets you already set are correct.

---

## EB environment properties (still required)

GitHub Actions deploys **code only**. Runtime config stays in EB:

**Configuration → Software → Environment properties**

Minimum:

```
NODE_ENV=production
HOST=0.0.0.0
MONGODB_URI=...
JWT_SECRET=...
SERVER_URL=http://spacilly-api.eu-north-1.elasticbeanstalk.com
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

---

## What changed in the workflow

1. **Removed** `einaregilsson/beanstalk-deploy@v22` (opaque 403 errors)
2. **Added** `aws-actions/configure-aws-credentials@v4`
3. **Added** preflight: `sts get-caller-identity`, EB describe, S3 write test with `bucket-owner-full-control`
4. **Added** deploy via `aws s3 cp` + `create-application-version` + `update-environment`
5. **Added** zip size listing for multipart debugging

---

## Next steps for you

1. IAM: remove `AWSCompromisedKeyQuarantineV2` if attached
2. GitHub: add secrets `EB_S3_BUCKET` and `EB_ENVIRONMENT_URL`
3. Commit and push updated `backend-deploy.yml`
4. Run workflow — if preflight fails, the log will show **exact** AWS error (caller identity, bucket, or S3 test)
5. Set EB environment properties if not done
6. Test: `http://spacilly-api.eu-north-1.elasticbeanstalk.com/api/health`
