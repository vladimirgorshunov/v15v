# AWS Static Deployment Runbook

This runbook documents how to deploy this static site to the existing AWS stack
(`S3 + CloudFront + Route53`) and how GitHub Actions deploys on merged PRs to
`master`.

## 1. Inventory Existing AWS Resources

Run these commands with read-only AWS credentials to discover your current IDs:

```bash
aws route53 list-hosted-zones \
  --query "HostedZones[].{Id:Id,Name:Name}"

aws cloudfront list-distributions \
  --query "DistributionList.Items[].{Id:Id,Aliases:Aliases.Items,Origins:Origins.Items[*].DomainName}"

aws cloudfront get-distribution \
  --id <CF_DISTRIBUTION_ID> \
  --query "Distribution.DistributionConfig.Origins.Items"

aws s3api get-bucket-location \
  --bucket <S3_BUCKET>
```

Save these values for GitHub configuration:

- `AWS_REGION`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `HOSTED_ZONE_ID`
- `DOMAIN`

## 2. Validate CloudFront SPA Behavior

Check distribution settings:

```bash
aws cloudfront get-distribution \
  --id <CF_DISTRIBUTION_ID> \
  --query "Distribution.DistributionConfig.{DefaultRootObject:DefaultRootObject,CustomErrorResponses:CustomErrorResponses.Items,Aliases:Aliases.Items,ViewerCertificate:ViewerCertificate,Origins:Origins.Items}"
```

Expected:

- Default root object is `index.html`.
- Route53 aliases point to this distribution.
- TLS certificate is attached in CloudFront viewer certificate.
- SPA fallback is configured:
  - If S3 REST origin is used: custom error responses map `403` and `404` to
    `/index.html` with response code `200`.
  - If S3 website origin is used: website error document effectively serves app
    entry for client routes.

## 3. Create GitHub OIDC Deploy Role

Use an IAM role assumed by GitHub Actions via OIDC. This avoids static AWS
access keys.

### 3.1 Trust policy template

Replace account/repo values before creating the role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:vladimirgorshunov/v15v:pull_request",
            "repo:vladimirgorshunov/v15v:environment:production"
          ]
        }
      }
    }
  ]
}
```

### 3.2 Permission policy template

Replace placeholders before attaching policy to the role.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketMetadata",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::<S3_BUCKET>"
    },
    {
      "Sid": "BucketObjects",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<S3_BUCKET>/*"
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": "arn:aws:cloudfront::<AWS_ACCOUNT_ID>:distribution/<CF_DISTRIBUTION_ID>"
    }
  ]
}
```

## 4. Configure GitHub Repository

### 4.1 Environment

Create environment: `production`.

### 4.2 Variables

Configure these repository or environment variables:

- `AWS_REGION`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_SANITY_PROJECT_ID` (optional)
- `VITE_SANITY_DATASET` (optional)
- `VITE_SANITY_API_VERSION` (optional)
- `VITE_SANITY_USE_CDN` (optional)

### 4.3 Secrets

Configure this secret:

- `AWS_ROLE_ARN`

### 4.4 Branch protection

Protect `master`:

- Require pull requests.
- Require status checks to pass before merge.
- Disallow direct pushes.

## 5. GitHub Actions Deployment Workflow

Workflow file:

- `.github/workflows/deploy-production.yml`

Behavior:

- Trigger on merged PRs to `master` (`pull_request` + `types: [closed]`).
- Allow manual redeploy via `workflow_dispatch` with optional input `ref`.
- Re-run `lint`, `typecheck`, `unit`, `e2e`, and `build` on the merge commit.
- Upload `.output/public` artifact from verify job.
- Deploy artifact to S3 with `aws s3 sync --delete`.
- Invalidate CloudFront paths `/*` and wait for completion.
- Concurrency guard prevents overlapping production deploys.

## 6. Manual Redeploy and Rollback

Use GitHub Actions `Deploy Production` workflow -> `Run workflow`:

- Leave `ref` empty to deploy latest `master`.
- Set `ref` to a previous commit SHA to rollback.

Recommended rollback flow:

1. Find last known good commit SHA.
2. Run workflow manually with that `ref`.
3. Wait for workflow success and CloudFront invalidation completion.
4. Validate:
   - `/`
   - `/about` (redirects to `/`)
   - `/blog`
   - `/static/CV.pdf`
   - unknown route redirects to `/404`

## 7. Troubleshooting

- `Missing secret: AWS_ROLE_ARN`: add secret in repo/environment settings.
- `Missing variable: ...`: add required variable in repo/environment settings.
- `AccessDenied` from AWS:
  - verify OIDC trust policy `aud/sub` conditions
  - verify IAM role permissions for bucket and distribution IDs
  - verify workflow is using correct `AWS_ROLE_ARN`, `S3_BUCKET`, and
    `CLOUDFRONT_DISTRIBUTION_ID`
