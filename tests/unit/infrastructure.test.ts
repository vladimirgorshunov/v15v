import { describe, expect, test } from 'bun:test'
import { Template } from 'aws-cdk-lib/assertions'
import { buildApp } from '../../infrastructure/lib/app'

const { site, github } = buildApp()
const siteTemplate = Template.fromStack(site)
const githubTemplate = Template.fromStack(github)

const siteIds = [
  'SiteBucket',
  'SiteBucketPolicy',
  'SsrExecutionRole',
  'SsrLogGroup',
  'SsrFunction',
  'SsrFunctionUrl',
  'SsrCloudFrontInvokeUrlPermission',
  'SsrCloudFrontInvokePermission',
  'S3OriginAccessControl',
  'LambdaOriginAccessControl',
  'AboutRedirectFunction',
  'Distribution',
]
const githubIds = [
  'GithubOidcProvider',
  'SiteDeployRole',
  'SiteDeployPolicyV15vGithubDeploy',
  'InfraDeployRole',
  'InfraPreviewRole',
]

interface Resource {
  Type: string
  DeletionPolicy?: string
  UpdateReplacePolicy?: string
}

describe('infrastructure import safety', () => {
  test('keeps imported logical IDs stable in managed bucket mode', () => {
    const siteResources = siteTemplate.toJSON().Resources as Record<
      string,
      Resource
    >
    const githubResources = githubTemplate.toJSON().Resources as Record<
      string,
      Resource
    >
    expect(Object.keys(siteResources).sort()).toEqual(siteIds.sort())
    expect(Object.keys(githubResources).sort()).toEqual(githubIds.sort())
  })

  test('retains every resource on deletion and replacement', () => {
    for (const template of [siteTemplate, githubTemplate]) {
      const resources = template.toJSON().Resources as Record<string, Resource>
      for (const resource of Object.values(resources)) {
        expect(resource.DeletionPolicy).toBe('Retain')
        expect(resource.UpdateReplacePolicy).toBe('Retain')
      }
    }
  })

  test('does not take ownership of release artifacts or add metadata', () => {
    for (const template of [siteTemplate, githubTemplate]) {
      template.resourceCountIs('AWS::Lambda::Version', 0)
      template.resourceCountIs('AWS::Lambda::Alias', 0)
      template.resourceCountIs('AWS::CDK::Metadata', 0)
    }
  })

  test('restricts each OIDC role to its exact audience and subject', () => {
    for (const [roleName, subject] of [
      ['github-actions-v15v-deploy', 'environment:production'],
      ['v15v-infra-deploy', 'environment:infrastructure'],
      ['v15v-infra-preview', 'pull_request'],
    ]) {
      githubTemplate.hasResourceProperties('AWS::IAM::Role', {
        RoleName: roleName,
        AssumeRolePolicyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Federated: { 'Fn::GetAtt': ['GithubOidcProvider', 'Arn'] },
              },
              Action: 'sts:AssumeRoleWithWebIdentity',
              Condition: {
                StringEquals: {
                  'token.actions.githubusercontent.com:aud':
                    'sts.amazonaws.com',
                  'token.actions.githubusercontent.com:sub': `repo:vladimirgorshunov/v15v:${subject}`,
                },
              },
            },
          ],
        },
      })
    }
  })
})
