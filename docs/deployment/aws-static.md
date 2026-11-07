# AWS SSR Deployment Runbook

CloudFront serves every page through a buffered Lambda Function URL. Private S3
serves only static files. GitHub Actions publishes protected `master` commits.
These are required settings, not proof of live state; verify after each change.

## 1. Resource Inventory

Known production resources:

- AWS account: `031152122952`
- S3 bucket: `v15v-frontend-prod`, region `eu-north-1`
- CloudFront distribution: `E2F8HY0X5P5F2R`
- Domains: `v15v.com` and `www.v15v.com`
- Lambda: `v15v-ssr`, alias `production`, region `eu-north-1`
- Runtime: `nodejs24.x`, arm64, handler `index.handler`, 1024 MB, 10 s
- Execution role: `v15v-ssr-lambda`; logs `/aws/lambda/v15v-ssr`, 30-day retention
- Lambda OAC: `v15v-ssr-lambda-oac`, origin type `lambda`, SigV4 `always`

Use scoped, temporary non-root credentials for inventory and configuration
repairs. The deployment role only publishes artifacts; it is not an
infrastructure-administration role.

Discover the current certificate, origin access control (OAC), viewer-request
function, and DNS records rather than assuming their identifiers:

```bash
aws cloudfront get-distribution --id E2F8HY0X5P5F2R \
  --query 'Distribution.{Status:Status,Config:DistributionConfig}'
aws s3api get-bucket-location --bucket v15v-frontend-prod
aws s3api get-public-access-block --bucket v15v-frontend-prod
aws s3api get-bucket-ownership-controls --bucket v15v-frontend-prod
aws s3api get-bucket-policy --bucket v15v-frontend-prod
aws acm list-certificates --region us-east-1
aws route53 list-hosted-zones \
  --query 'HostedZones[].{Id:Id,Name:Name}'
```

Save `AWS_REGION`, `S3_BUCKET`, and `CLOUDFRONT_DISTRIBUTION_ID` for GitHub.
Repair resources:

- Issued ACM certificate in `us-east-1`:
  `arn:aws:acm:us-east-1:031152122952:certificate/5ab9705f-cc60-4819-a295-53dcb711eaec`.
- OAC: `EG0MIJXG7JJII`.
- Redirect function: `v15v-about-redirect`, sourced from
  `infrastructure/cloudfront-about-redirect.js`.

Inspect the distribution and LIVE function when verifying deployed state.

## 2. Required Origin, TLS, and Routing Configuration

### Private S3 REST origin

- Use the regional S3 REST endpoint, not an S3 website endpoint.
- Attach a CloudFront OAC with SigV4 signing set to `always`.
- Enable all four S3 Block Public Access settings.
- Use `BucketOwnerEnforced` ownership to disable ACLs; remove public grants and
  public bucket-policy statements. Do not upload public-read ACLs.
- Grant object reads only to CloudFront for this distribution. The deployment
  role writes objects through its own identity policy and does not need object
  read access.

The origin-read bucket policy statement is:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowProductionCloudFrontRead",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::v15v-frontend-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::031152122952:distribution/E2F8HY0X5P5F2R",
          "AWS:SourceAccount": "031152122952"
        }
      }
    }
  ]
}
```

### TLS and HTTPS

- Attach an **issued ACM certificate in `us-east-1`** whose SANs include both
  `v15v.com` and `www.v15v.com`. A wildcard alone does not cover the apex.
- Configure both names as CloudFront aliases and point their Route 53 alias
  records to the distribution. Maintain ACM DNS validation records.
- Set viewer protocol policy to `redirect-to-https` for every applicable cache
  behavior. Remove the legacy `/*` behavior that used `allow-all` and shadowed
  the default HTTPS policy; checking only the default behavior is insufficient.
- Disable HTML caching using managed `CachingDisabled`
  (`4135ea2d-6df8-44a3-9df3-4b5a84be39ad`). HTML emits `Cache-Control: no-cache`.

### Lambda pages and S3 assets

The default behavior targets origin `v15v-ssr-lambda`, using the alias Function
URL with `AWS_IAM` authentication and `BUFFERED` invocation. Attach the Lambda
OAC, and allow CloudFront `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction`
on the alias, constrained to this distribution's ARN. Anonymous direct Function
URL access must return 403. No VPC is needed for public Sanity HTTPS reads.

Set the distribution's `DefaultRootObject` to an empty string. Retaining the
static site's `index.html` value makes CloudFront request `/index.html` from
Lambda instead of `/`, causing the home URL to redirect to `/404`.

Use managed `AllViewerExceptHostHeader`
(`b689b0a8-53d0-40ab-baf2-68738e2966ac`) to forward query strings, cookies and
headers except the viewer Host, which Function URLs reject. Allow GET/HEAD only.
Browser POST/PUT through Lambda OAC requires `x-amz-content-sha256`; adding
server functions needs a separate design.

Four ordered behaviors target the unchanged private S3 origin/OAC:
`/assets/*`, `/static/*`, `/favicon.ico`, `/robots.txt`. They inherit the previous
S3 caching/request/response policies and have no edge function.

Only the default behavior uses the viewer-request redirect function:
`/about` and `/about/` return 301 to `/`, preserving query pairs. All other
requests pass unchanged to Lambda. Unknown URLs and missing posts redirect 307
to `/404`; `/404` responds 404.

`bun run build` produces `.output/server/index.mjs` exporting `handler` and
`.output/public/` containing assets/static resources, no HTML. Lambda does not
serve static files. `bun run preview` starts `tests/e2e/edge-server.ts` on
127.0.0.1:4173, emulating the exact behavior split and invoking the built Lambda.
Build before preview. Playwright builds automatically with Sanity disabled.

Run the build with Node (`bun run build`), never with `bun --bun run build`.
Nitro uses the host's built-in module list; Bun lists `undici` as a built-in
although Node Lambda does not. A Bun-hosted build therefore omits a Sanity
runtime dependency. Verify the archive outside the repository's `node_modules`
and invoke the published Lambda before promoting its alias.

CloudFront JavaScript runtime 2.0 is not Node.js: it supports ES5 iteration but
not `for...of`. Keep the edge source within the
[documented runtime features](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html).
Before promotion, test the DEVELOPMENT function in CloudFront with
`cloudfront:TestFunction` permission scoped to this function. Local VM/browser
tests do not establish platform syntax compatibility. After publishing, verify
live home, alias redirect, blog navigation, and missing-asset responses.

Keep global custom error responses empty. Missing S3 files must retain their
non-success status rather than becoming an HTML page with status 200.

## 3. GitHub OIDC Deploy Role

Use short-lived GitHub OIDC credentials, not static AWS access keys.

### Environment-only trust policy

The exact `production` environment subject is the only allowed subject. Do not
allow `pull_request`, branch wildcards, or repository-wide subjects. Because the
environment subject does not encode a branch, its master-only deployment rule is
part of this security boundary.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::031152122952:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:vladimirgorshunov/v15v:environment:production"
        }
      }
    }
  ]
}
```

### Deployment permissions

Keep existing S3/CloudFront permissions untouched. The workflow retains old
objects and never invokes deletion. It does not need public ACLs, object reads,
bucket-policy administration, or `iam:PassRole`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketMetadata",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::v15v-frontend-prod"
    },
    {
      "Sid": "BucketObjects",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::v15v-frontend-prod/*"
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": "arn:aws:cloudfront::031152122952:distribution/E2F8HY0X5P5F2R"
    }
  ]
}
```

Add a separate inline policy `v15v-ssr-deploy` on the existing deploy role:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublishSsrLambda",
    "Effect": "Allow",
    "Action": [
      "lambda:UpdateFunctionCode", "lambda:PublishVersion", "lambda:GetFunction",
      "lambda:GetFunctionConfiguration", "lambda:InvokeFunction",
      "lambda:GetAlias", "lambda:UpdateAlias"
    ],
    "Resource": [
      "arn:aws:lambda:eu-north-1:031152122952:function:v15v-ssr",
      "arn:aws:lambda:eu-north-1:031152122952:function:v15v-ssr:*"
    ]
  }]
}
```

The execution role trusts `lambda.amazonaws.com` and grants only
`logs:CreateLogStream` and `logs:PutLogEvents` on
`arn:aws:logs:eu-north-1:031152122952:log-group:/aws/lambda/v15v-ssr:*`.
Create the log group separately and retain logs for 30 days.

## 4. GitHub Repository Configuration

Create the `production` environment and allow deployments from **only the
`master` branch**, with no tag allowance. Both `verify` and `deploy` bind to this
environment so build-time variables remain available. Any required environment
review applies to both jobs.

Configure these repository or environment variables:

- `AWS_REGION` = `eu-north-1`
- `S3_BUCKET` = `v15v-frontend-prod`
- `CLOUDFRONT_DISTRIBUTION_ID` = `E2F8HY0X5P5F2R`
- `LAMBDA_FUNCTION_NAME` = `v15v-ssr`
- `VITE_SANITY_PROJECT_ID` (required)
- `VITE_SANITY_DATASET` (required)
- `VITE_SANITY_API_VERSION` (optional)
- `VITE_SANITY_USE_CDN` (optional)

Configure the `AWS_ROLE_ARN` secret for the deploy role. No AWS access keys belong
in repository files or build artifacts.

Protect `master`: require pull requests and CI's `verify` check, enforce the
rule for administrators, and prevent force pushes, deletion, and direct-push
bypasses. This single-owner setup does not require a counted approval. Review
deployment workflow and build-input changes as part of the pull request. These
controls and the master-only environment rule keep unmerged source branches
outside the production execution path.

## 5. Deployment Workflow and Cache Ordering

Workflow: `.github/workflows/deploy-production.yml`.

1. Trigger on a **push to `master`**, or manually with `workflow_dispatch`.
   Closing an unmerged PR does not start or interrupt a deployment.
2. Require the workflow itself to run from `master`. Fetch full master history
   and tags before executing repository code. Resolve a supplied manual commit,
   tag, or branch (including remote branches). Otherwise select current
   `origin/master`, not an older push-event SHA or the dispatch branch. This
   prevents out-of-order automatic runs from publishing an older event commit.
3. Require the selected commit to be an ancestor of `origin/master` before
   checking it out, installing dependencies, or running its code. Non-master
   history refs fail, even if their source branch exists in the repository.
4. With production variables, run lint, typecheck, unit tests, and build using
   the workflow's existing pinned actions/runtimes. Require Sanity project and
   dataset values.
5. Require `.output/server/index.mjs` and `.output/public/assets`, then invoke
   the local handler with Node and require home-page HTML. Zip the server
   directory (under 50,000,000 bytes). Upload `site-public` and `site-server`
   artifacts; require both downloaded artifacts before AWS authentication.
6. Upload `assets/` **first**, with
   `Cache-Control: public,max-age=31536000,immutable`.
7. Upload other static resources with
   `Cache-Control: public,max-age=0,must-revalidate`.
8. Update Lambda code and publish an immutable version. Wait until active.
9. Invoke that qualified version for `/` and `/blog` with Function URL v2
   events. Require no FunctionError, status 200, home text and a blog heading.
   Any failed check stops deployment before the production alias changes.
10. Move `production` to the verified version. The Actions summary prints the
    previous/new versions and the exact instant alias rollback command.
11. Invalidate CloudFront `/*` and wait for completion.

Old hashed assets are never deleted, keeping earlier Lambda versions usable.

The workflow-level `production-deploy` concurrency group serializes the entire
verify/deploy run with `cancel-in-progress: false`. New runs do not abort an
active publication or invalidation. GitHub may replace an older *pending* run
with a newer pending run; this is not a FIFO deployment queue. S3 object writes
are ordered, not an atomic site-wide transaction, and retained non-versioned
resources are not a substitute for versioning application bundles.

Retaining older assets increases S3 storage use, and the viewer-request
CloudFront Function adds request-based charges. Review actual account usage
before setting any separate retention policy; automatic pruning is not part of
deployment.
See [S3 pricing](https://aws.amazon.com/s3/pricing/) and
[CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/) for current rates.

## 6. Manual Redeploy and Rollback

In **Deploy Production → Run workflow**, select workflow branch `master`:

- Leave `ref` empty for current master.
- Supply a previous known-good master-history commit SHA for rollback, or a tag
  resolving to such a commit. Unmerged branches and unrelated commits fail.
- Only post-SSR commits are valid rollback targets. Pre-SSR commits fail the
  `.output/server/index.mjs` artifact check intentionally.

Wait for verification, deployment, and CloudFront invalidation to succeed, then
perform the checks below. A rollback rebuilds the selected source with the
current workflow and current production Sanity configuration/content; it does
not restore a historical CMS snapshot. Previously published hashed assets are
retained for existing clients. Do not manually prune them during an incident.
Instant application rollback (use the version printed in the Actions summary):

```bash
aws lambda update-alias --region eu-north-1 --function-name v15v-ssr \
  --name production --function-version <previous-version>
```

For infrastructure rollback, keep the pre-cutover `get-distribution-config`
response outside the repository. Fetch the current ETag, restore the saved
`DistributionConfig` with `update-distribution --if-match`, wait for deployment,
then invalidate `/*` and wait. The old S3 HTML (`index.html`, `_shell.html`,
`404/index.html`), old assets and unattached `v15v-navigation` function are
intentionally retained for this rollback. Do not delete them during cutover.

## 7. Verification and Troubleshooting

After infrastructure changes and after deployment, inspect live settings and
exercise actual browser navigation. Do not infer success from a build alone.

- Both `http://v15v.com/` and `http://www.v15v.com/` redirect to HTTPS; TLS validates
  for the apex and www names. Confirm the issued certificate's SANs in ACM in
  `us-east-1` and the viewer certificate attached to CloudFront.
- Confirm the deployed distribution has the REST origin, OAC, expected LIVE
  viewer-request function, no shadowing allow-all behavior, and no global
  error-to-home `200` response. Wait for distribution status `Deployed`.
- Confirm S3 Block Public Access and ownership controls; anonymous direct S3
  object requests must fail while the CloudFront site succeeds.
- Load `/`, directly load and reload `/blog` and a real blog-detail URL, and
  navigate between them. Check browser console for hydration or chunk errors.
- Verify `/about?x=1` returns 301 to `/?x=1`, `/static/CV.pdf` is a PDF,
  unknown URLs and missing posts return 307 to `/404`, and `/404` returns 404.
- Request a deliberately missing `/assets/not-present.js`: expect a non-success
  response, never HTML with status `200`. Repeat for a missing static file.
- Check HTML `Cache-Control: no-cache`, article body text without JavaScript,
  and hashed asset `public,max-age=31536000,immutable`. Direct Function URL
  requests must return 403. Keep old chunks available across deployments.
- Check cold `REPORT` log lines: `Init Duration` ≤1500 ms. After at least
  30 minutes idle, measure home `time_starttransfer` ≤3 s. If exceeded, raise
  memory to 1536 MB and publish/smoke/switch a new version before remeasuring.
  Do not enable provisioned concurrency without approval (fixed monthly cost).
- Inspect the Actions run to confirm the selected commit is on master history,
  publication order, and completed invalidation. A rejected unmerged manual
  ref must stop before dependency installation or repository scripts run.

For `Missing secret: AWS_ROLE_ARN` or `Missing variable: ...`, check production
secrets/variables and both jobs' environment bindings. For OIDC `AccessDenied`,
check the exact audience/environment subject, master-only environment rule, and
role ARN. For S3 errors, check bucket and identity-policy scopes; do not fix them
by making the bucket public or adding object-read permissions to the deployer.
For artifact validation failures, inspect the selected source and generated
Lambda output. Never restore an HTML error fallback. Infrastructure repairs
require separately authorized administration, not broader deploy-role privileges.
