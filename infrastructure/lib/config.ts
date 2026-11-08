import { CfnResource, RemovalPolicy } from 'aws-cdk-lib'
import type { Stack } from 'aws-cdk-lib'

export const ACCOUNT = '031152122952'
export const REGION = 'eu-north-1'
export const ENV = { account: ACCOUNT, region: REGION }
export const GITHUB_REPO = 'vladimirgorshunov/v15v'
export const DISTRIBUTION_ID = 'E2F8HY0X5P5F2R'
export const DISTRIBUTION_ARN = `arn:aws:cloudfront::${ACCOUNT}:distribution/${DISTRIBUTION_ID}`
export const FUNCTION_NAME = 'v15v-ssr'
export const LAMBDA_ALIAS = 'production'
export const CERTIFICATE_ARN =
  'arn:aws:acm:us-east-1:031152122952:certificate/5ab9705f-cc60-4819-a295-53dcb711eaec'
export const OIDC_PROVIDER_ARN = `arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com`
export const BOOTSTRAP_QUALIFIER = 'hnb659fds'
export const SITE_DEPLOY_ROLE_NAME = 'github-actions-v15v-deploy'
export const BUCKET_NAME = 'v15v-frontend-prod'

export function retainAll(stack: Stack): void {
  for (const node of stack.node.findAll()) {
    if (node instanceof CfnResource)
      node.applyRemovalPolicy(RemovalPolicy.RETAIN)
  }
}
