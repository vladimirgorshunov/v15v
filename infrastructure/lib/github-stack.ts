import { Stack } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'

import {
  ACCOUNT,
  BOOTSTRAP_QUALIFIER,
  GITHUB_REPO,
  REGION,
  SITE_DEPLOY_ROLE_NAME,
  retainAll,
} from './config'
import type { StackProps } from 'aws-cdk-lib'
import type { Construct } from 'constructs'

export class GithubStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const githubOidcProvider = new iam.CfnOIDCProvider(
      this,
      'GithubOidcProvider',
      {
        url: 'https://token.actions.githubusercontent.com',
        clientIdList: ['sts.amazonaws.com'],
        thumbprintList: ['2b18947a6a9fc7764fd8b5fb18a863b0c6dac24f'],
        tags: [],
      },
    )

    const siteDeployPolicy = new iam.CfnManagedPolicy(
      this,
      'SiteDeployPolicyV15vGithubDeploy',
      {
        managedPolicyName: 'v15v-github-deploy-policy',
        path: '/',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'BucketMetadata',
              Effect: 'Allow',
              Action: ['s3:ListBucket', 's3:GetBucketLocation'],
              Resource: 'arn:aws:s3:::v15v-frontend-prod',
            },
            {
              Sid: 'BucketObjects',
              Effect: 'Allow',
              Action: ['s3:PutObject', 's3:DeleteObject'],
              Resource: 'arn:aws:s3:::v15v-frontend-prod/*',
            },
            {
              Sid: 'CloudFrontInvalidate',
              Effect: 'Allow',
              Action: [
                'cloudfront:CreateInvalidation',
                'cloudfront:GetInvalidation',
              ],
              Resource:
                'arn:aws:cloudfront::031152122952:distribution/E2F8HY0X5P5F2R',
            },
          ],
        },
      },
    )

    new iam.CfnRole(this, 'SiteDeployRole', {
      roleName: SITE_DEPLOY_ROLE_NAME,
      path: '/',
      description: '',
      maxSessionDuration: 3600,
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Federated: githubOidcProvider.attrArn },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:sub':
                  'repo:vladimirgorshunov/v15v:environment:production',
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              },
            },
          },
        ],
      },
      managedPolicyArns: [siteDeployPolicy.ref],
      policies: [
        {
          policyName: 'v15v-ssr-deploy',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublishSsrLambda',
                Effect: 'Allow',
                Action: [
                  'lambda:UpdateFunctionCode',
                  'lambda:PublishVersion',
                  'lambda:GetFunction',
                  'lambda:GetFunctionConfiguration',
                  'lambda:InvokeFunction',
                  'lambda:GetAlias',
                  'lambda:UpdateAlias',
                ],
                Resource: [
                  'arn:aws:lambda:eu-north-1:031152122952:function:v15v-ssr',
                  'arn:aws:lambda:eu-north-1:031152122952:function:v15v-ssr:*',
                ],
              },
            ],
          },
        },
      ],
    })

    const bootstrapRolePrefix = `arn:aws:iam::${ACCOUNT}:role/cdk-${BOOTSTRAP_QUALIFIER}`
    const bootstrapRoleSuffix = `${ACCOUNT}-${REGION}`
    const lookupRoleArn = `${bootstrapRolePrefix}-lookup-role-${bootstrapRoleSuffix}`

    new iam.CfnRole(this, 'InfraDeployRole', {
      roleName: 'v15v-infra-deploy',
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Federated: githubOidcProvider.attrArn },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:environment:infrastructure`,
              },
            },
          },
        ],
      },
      policies: [
        {
          policyName: 'cdk-bootstrap-roles',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: 'sts:AssumeRole',
                Resource: [
                  `${bootstrapRolePrefix}-deploy-role-${bootstrapRoleSuffix}`,
                  `${bootstrapRolePrefix}-file-publishing-role-${bootstrapRoleSuffix}`,
                  lookupRoleArn,
                ],
              },
            ],
          },
        },
      ],
    })

    new iam.CfnRole(this, 'InfraPreviewRole', {
      roleName: 'v15v-infra-preview',
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Federated: githubOidcProvider.attrArn },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                'token.actions.githubusercontent.com:sub': `repo:${GITHUB_REPO}:pull_request`,
              },
            },
          },
        ],
      },
      policies: [
        {
          policyName: 'cdk-diff-read',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: 'sts:AssumeRole',
                Resource: lookupRoleArn,
              },
              {
                Effect: 'Allow',
                Action: [
                  'cloudformation:DescribeStacks',
                  'cloudformation:GetTemplate',
                ],
                Resource: [
                  `arn:aws:cloudformation:${REGION}:${ACCOUNT}:stack/V15vSite/*`,
                  `arn:aws:cloudformation:${REGION}:${ACCOUNT}:stack/V15vGithub/*`,
                ],
              },
              {
                Effect: 'Allow',
                Action: 'ssm:GetParameter',
                Resource: `arn:aws:ssm:${REGION}:${ACCOUNT}:parameter/cdk-bootstrap/${BOOTSTRAP_QUALIFIER}/version`,
              },
            ],
          },
        },
      ],
    })

    retainAll(this)
  }
}
