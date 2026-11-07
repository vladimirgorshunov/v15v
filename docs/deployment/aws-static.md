# AWS Static Deployment Runbook

The production site uses private S3 storage behind CloudFront and Route 53.
GitHub Actions publishes protected `master` commits, including explicitly selected
older commits for rollback. The settings below are the required configuration;
use the verification steps to establish live state, not this document as proof of
an applied change.

## 1. Resource Inventory

Known production resources:

- AWS account: `031152122952`
- S3 bucket: `v15v-frontend-prod`, region `eu-north-1`
- CloudFront distribution: `E2F8HY0X5P5F2R`
- Domains: `v15v.com` and `www.v15v.com`

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
- Navigation function: `v15v-navigation`, sourced from
  `infrastructure/cloudfront-navigation.js`.

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
- Use minimum cache TTL zero for HTML/shell responses so their origin `no-cache`
  headers are respected. Disable HTML caching if the policy cannot honor these
  headers. Hashed assets may retain their long immutable lifetime.

### Genuine shell, not an error-to-home fallback

The static artifact contains:

- `index.html`: prerendered home page.
- `_shell.html`: TanStack's generated SPA/hydration shell, not home-page HTML.
- `404/index.html`: prerendered not-found entry.
- `assets/`: generated versioned client bundles and resources.

Associate the production routing function at **viewer request**. Preserve the
`/about` to `/` redirect, serve `/` from the home entry, and rewrite client
navigation (including `/blog` and blog-detail deep links) to `/_shell.html`.
Retain the dedicated `/404` entry. Static resource requests, including missing
`.js`, `.css`, images and `/static/CV.pdf`, must not be rewritten to home or the
shell. Unknown navigation must reach the application's not-found handling, not
hydrate a prerendered home page.

The static-only browser test server executes the same navigation function source.
Navigation links inside the shared shell render after hydration because their
active state depends on the requested URL.

CloudFront JavaScript runtime 2.0 is not Node.js: it supports ES5 iteration but
not `for...of`. Keep the edge source within the
[documented runtime features](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html).
Before promotion, test the DEVELOPMENT function in CloudFront with
`cloudfront:TestFunction` permission scoped to this function. Local VM/browser
tests do not establish platform syntax compatibility. After publishing, verify
live home, alias redirect, blog navigation, and missing-asset responses.

Remove global `403`/`404` custom error responses that return `/index.html` with
status `200`. Private S3 may return `403` for a missing object; preserve the
non-success status for missing assets instead of replacing it with HTML. The
viewer-request rewrite selects the real shell before origin access; it is not
an error fallback. An absent shell must therefore fail deployment validation.

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

The existing deployment permissions can use this scope. The workflow performs
only local-to-S3 uploads and CloudFront invalidation; it does not need
`s3:GetObject`, public ACL permissions, or bucket-policy administration.
`DeleteObject` is an existing permission, not an instruction to delete retained
assets; the workflow never invokes deletion.

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

## 4. GitHub Repository Configuration

Create the `production` environment and allow deployments from **only the
`master` branch**, with no tag allowance. Both `verify` and `deploy` bind to this
environment so build-time variables remain available. Any required environment
review applies to both jobs.

Configure these repository or environment variables:

- `AWS_REGION` = `eu-north-1`
- `S3_BUCKET` = `v15v-frontend-prod`
- `CLOUDFRONT_DISTRIBUTION_ID` = `E2F8HY0X5P5F2R`
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
5. Validate nonempty home, shell, and 404 entries and the generated assets
   directory. Upload `.output/public` as `site-public`. The deploy job checks the
   downloaded entries again before acquiring AWS credentials. Static-only browser
   checks verify the shell's runtime routing and hydration behavior.
6. Upload `assets/` **first**, with
   `Cache-Control: public,max-age=31536000,immutable`.
7. Upload other non-HTML static resources with
   `Cache-Control: public,max-age=0,must-revalidate`.
8. Upload all HTML entries, including `_shell.html`, **last**, with
   `Cache-Control: no-cache`. New HTML therefore refers to assets already
   uploaded. All uploads retain prior objects; there is no `sync --delete` or
   other deletion of old hashed chunks that active clients still need.
9. Invalidate CloudFront `/*` and wait for invalidation completion.

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
- Use a commit that emits the current shell/artifact contract. A commit from
  before `_shell.html` support is not a valid rollback target; artifact
  validation intentionally rejects it.

Wait for verification, deployment, and CloudFront invalidation to succeed, then
perform the checks below. A rollback rebuilds the selected source with the
current workflow and current production Sanity configuration/content; it does
not restore a historical CMS snapshot. Previously published hashed assets are
retained for existing clients. Do not manually prune them during an incident.
If publication fails partway through, rerun a known-good compatible commit;
HTML-last ordering reduces missing-chunk risk but does not make uploads atomic.

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
- Verify `/about` redirects to `/`, `/static/CV.pdf` is a PDF, and unknown client
  routes show the application's not-found handling rather than home content.
- Request a deliberately missing `/assets/not-present.js`: expect a non-success
  response, never HTML with status `200`. Repeat for a missing static file.
- Check `Cache-Control` on HTML/shell (`no-cache`) and a real hashed asset
  (`public,max-age=31536000,immutable`). Ensure CloudFront's policy honors HTML
  revalidation. Keep an old page open across a deploy and confirm its older
  lazy-loaded chunks remain available.
- Inspect the Actions run to confirm the selected commit is on master history,
  publication order, and completed invalidation. A rejected unmerged manual
  ref must stop before dependency installation or repository scripts run.

For `Missing secret: AWS_ROLE_ARN` or `Missing variable: ...`, check production
secrets/variables and both jobs' environment bindings. For OIDC `AccessDenied`,
check the exact audience/environment subject, master-only environment rule, and
role ARN. For S3 errors, check bucket and identity-policy scopes; do not fix them
by making the bucket public or adding object-read permissions to the deployer.
For shell/artifact validation failures, inspect the selected source's build
configuration and generated output; do not replace the shell with home HTML or
restore a global error fallback. Live configuration repairs require separately
authorized AWS/GitHub administration, not broader deployment-role privileges.
