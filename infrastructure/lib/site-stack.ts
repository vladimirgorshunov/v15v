import { readFileSync } from 'node:fs'
import { Fn, Stack } from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as sns from 'aws-cdk-lib/aws-sns'
import {
  ACCOUNT,
  BUCKET_NAME,
  CERTIFICATE_ARN,
  FUNCTION_NAME,
  LAMBDA_ALIAS,
  retainAll,
} from './config'
import type { StackProps } from 'aws-cdk-lib'
import type { Construct } from 'constructs'

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const siteBucket = new s3.CfnBucket(this, 'SiteBucket', {
      bucketName: BUCKET_NAME,
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true,
      },
      ownershipControls: {
        rules: [{ objectOwnership: 'BucketOwnerEnforced' }],
      },
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            serverSideEncryptionByDefault: { sseAlgorithm: 'AES256' },
            bucketKeyEnabled: false,
            blockedEncryptionTypes: { encryptionType: ['SSE-C'] },
          },
        ],
      },
      // Versioning and access logging are unconfigured in the live bucket.
      websiteConfiguration: {
        indexDocument: 'index.html',
        errorDocument: 'index.html',
      },
      tags: [
        { key: 'Project', value: 'v15v' },
        { key: 'Environment', value: 'prod' },
        { key: 'GitBranch', value: 'master' },
        { key: 'GitCommit', value: '234771a' },
      ],
    })

    const executionRole = new iam.CfnRole(this, 'SsrExecutionRole', {
      roleName: 'v15v-ssr-lambda',
      path: '/',
      maxSessionDuration: 3600,
      assumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'lambda.amazonaws.com' },
            Action: 'sts:AssumeRole',
          },
        ],
      },
      managedPolicyArns: [],
      policies: [
        {
          policyName: 'v15v-ssr-logs',
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: ['logs:CreateLogStream', 'logs:PutLogEvents'],
                Resource:
                  'arn:aws:logs:eu-north-1:031152122952:log-group:/aws/lambda/v15v-ssr:*',
              },
            ],
          },
        },
      ],
    })

    const logGroup = new logs.CfnLogGroup(this, 'SsrLogGroup', {
      logGroupName: '/aws/lambda/v15v-ssr',
      retentionInDays: 30,
      logGroupClass: 'STANDARD',
      deletionProtectionEnabled: false,
      bearerTokenAuthenticationEnabled: false,
      tags: [],
    })

    const ssrFunction = new lambda.CfnFunction(this, 'SsrFunction', {
      functionName: FUNCTION_NAME,
      role: executionRole.attrArn,
      runtime: 'nodejs24.x',
      architectures: ['arm64'],
      handler: 'index.handler',
      description: '',
      memorySize: 1024,
      timeout: 10,
      reservedConcurrentExecutions: 10,
      packageType: 'Zip',
      ephemeralStorage: { size: 512 },
      tracingConfig: { mode: 'PassThrough' },
      snapStart: { applyOn: 'None' },
      loggingConfig: { logFormat: 'Text', logGroup: logGroup.ref },
      // RuntimeVersionConfig is an observed runtime ARN, not an update-mode setting.
      code: {
        zipFile:
          "exports.handler = async () => { throw new Error('Code is published by deploy-production.yml') }",
      },
      tags: [],
    })

    const functionUrl = new lambda.CfnUrl(this, 'SsrFunctionUrl', {
      targetFunctionArn: ssrFunction.attrArn,
      qualifier: LAMBDA_ALIAS,
      authType: 'AWS_IAM',
      invokeMode: 'BUFFERED',
    })

    const s3Oac = new cloudfront.CfnOriginAccessControl(
      this,
      'S3OriginAccessControl',
      {
        originAccessControlConfig: {
          name: 'v15v-frontend-prod-oac',
          description:
            'Signed read access for the v15v production CloudFront distribution',
          originAccessControlOriginType: 's3',
          signingBehavior: 'always',
          signingProtocol: 'sigv4',
        },
      },
    )

    const lambdaOac = new cloudfront.CfnOriginAccessControl(
      this,
      'LambdaOriginAccessControl',
      {
        originAccessControlConfig: {
          name: 'v15v-ssr-lambda-oac',
          originAccessControlOriginType: 'lambda',
          signingBehavior: 'always',
          signingProtocol: 'sigv4',
        },
      },
    )

    const aboutRedirect = new cloudfront.CfnFunction(
      this,
      'AboutRedirectFunction',
      {
        name: 'v15v-about-redirect',
        autoPublish: true,
        functionConfig: {
          comment: 'v15v /about redirect',
          runtime: 'cloudfront-js-2.0',
        },
        functionCode: readFileSync(
          new URL('../cloudfront-about-redirect.js', import.meta.url),
          'utf8',
        ),
      },
    )

    const securityHeadersPolicyId = '67f7725c-6f97-4210-82d7-5512b31e9d03' // AWS managed SecurityHeadersPolicy

    const distribution = new cloudfront.CfnDistribution(this, 'Distribution', {
      distributionConfig: {
        aliases: ['v15v.com', 'www.v15v.com'],
        defaultRootObject: '',
        origins: [
          {
            id: 'S3-v15v-frontend-prod',
            domainName: siteBucket.attrRegionalDomainName,
            originPath: '',
            originCustomHeaders: [],
            s3OriginConfig: { originAccessIdentity: '', originReadTimeout: 30 },
            connectionAttempts: 3,
            connectionTimeout: 10,
            originShield: { enabled: false },
            originAccessControlId: s3Oac.attrId,
          },
          {
            id: 'v15v-ssr-lambda',
            domainName: Fn.select(
              2,
              Fn.split('/', functionUrl.attrFunctionUrl),
            ),
            originPath: '',
            originCustomHeaders: [],
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originProtocolPolicy: 'https-only',
              originSslProtocols: ['TLSv1.2'],
              originReadTimeout: 30,
              originKeepaliveTimeout: 5,
            },
            connectionAttempts: 3,
            connectionTimeout: 10,
            originShield: { enabled: false },
            originAccessControlId: lambdaOac.attrId,
          },
        ],
        originGroups: { quantity: 0 },
        defaultCacheBehavior: {
          targetOriginId: 'v15v-ssr-lambda',
          trustedSigners: [],
          trustedKeyGroups: [],
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['HEAD', 'GET'],
          cachedMethods: ['HEAD', 'GET'],
          smoothStreaming: false,
          compress: true,
          lambdaFunctionAssociations: [],
          functionAssociations: [
            {
              functionArn: aboutRedirect.attrFunctionArn,
              eventType: 'viewer-request',
            },
          ],
          fieldLevelEncryptionId: '',
          cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
          originRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
          responseHeadersPolicyId: securityHeadersPolicyId,
          grpcConfig: { enabled: false },
        },
        cacheBehaviors: [
          '/assets/*',
          '/static/*',
          '/favicon.ico',
          '/robots.txt',
        ].map((pathPattern) => ({
          pathPattern,
          targetOriginId: 'S3-v15v-frontend-prod',
          trustedSigners: [],
          trustedKeyGroups: [],
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['HEAD', 'GET'],
          cachedMethods: ['HEAD', 'GET'],
          smoothStreaming: false,
          compress: false,
          lambdaFunctionAssociations: [],
          functionAssociations: [],
          fieldLevelEncryptionId: '',
          responseHeadersPolicyId: securityHeadersPolicyId,
          grpcConfig: { enabled: false },
          forwardedValues: {
            queryString: false,
            cookies: { forward: 'none' },
            headers: [],
            queryStringCacheKeys: [],
          },
          minTtl: 0,
          defaultTtl: 86400,
          maxTtl: 31536000,
        })),
        customErrorResponses: [],
        comment: '',
        // Live Logging.Enabled is false; CloudFormation disables logging by omission.
        priceClass: 'PriceClass_All',
        enabled: true,
        viewerCertificate: {
          acmCertificateArn: CERTIFICATE_ARN,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2021',
        },
        restrictions: {
          geoRestriction: { restrictionType: 'none', locations: [] },
        },
        webAclId: '',
        httpVersion: 'http2and3',
        ipv6Enabled: true,
        continuousDeploymentPolicyId: '',
        staging: false,
      },
      tags: [],
    })

    new s3.CfnBucketPolicy(this, 'SiteBucketPolicy', {
      bucket: siteBucket.ref,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowV15vCloudFrontReadOnly',
            Effect: 'Allow',
            Principal: { Service: 'cloudfront.amazonaws.com' },
            Action: 's3:GetObject',
            Resource: `${siteBucket.attrArn}/*`,
            Condition: {
              StringEquals: {
                'AWS:SourceArn': `arn:aws:cloudfront::${ACCOUNT}:distribution/${distribution.ref}`,
                'AWS:SourceAccount': ACCOUNT,
              },
            },
          },
        ],
      },
    })

    new lambda.CfnPermission(this, 'SsrCloudFrontInvokeUrlPermission', {
      action: 'lambda:InvokeFunctionUrl',
      functionName:
        'arn:aws:lambda:eu-north-1:031152122952:function:v15v-ssr:production',
      principal: 'cloudfront.amazonaws.com',
      sourceArn: `arn:aws:cloudfront::${ACCOUNT}:distribution/${distribution.ref}`,
    })

    new lambda.CfnPermission(this, 'SsrCloudFrontInvokePermission', {
      action: 'lambda:InvokeFunction',
      functionName:
        'arn:aws:lambda:eu-north-1:031152122952:function:v15v-ssr:production',
      principal: 'cloudfront.amazonaws.com',
      sourceArn: `arn:aws:cloudfront::${ACCOUNT}:distribution/${distribution.ref}`,
    })

    const alarmTopic = new sns.CfnTopic(this, 'AlarmTopic', {
      topicName: 'v15v-alarms',
    })

    new logs.CfnMetricFilter(this, 'SanityFailureMetricFilter', {
      logGroupName: logGroup.ref,
      filterName: 'v15v-sanity-fetch-failed',
      // Matches the event literal logged by src/lib/blog.ts.
      filterPattern: '"sanity_fetch_failed"',
      metricTransformations: [
        {
          metricNamespace: 'V15v',
          metricName: 'SanityFetchFailures',
          metricValue: '1',
        },
      ],
    })

    const ssrDimensions = [{ name: 'FunctionName', value: FUNCTION_NAME }]
    const alarms = [
      [
        'SsrErrorsAlarm',
        'v15v-ssr-errors',
        'AWS/Lambda',
        'Errors',
        ssrDimensions,
      ],
      [
        'SsrThrottlesAlarm',
        'v15v-ssr-throttles',
        'AWS/Lambda',
        'Throttles',
        ssrDimensions,
      ],
      [
        'SsrUrl5xxAlarm',
        'v15v-ssr-url-5xx',
        'AWS/Lambda',
        'Url5xxCount',
        ssrDimensions,
      ],
      [
        'SanityFailureAlarm',
        'v15v-sanity-fetch-failures',
        'V15v',
        'SanityFetchFailures',
        [],
      ],
    ] as const
    for (const [
      alarmId,
      alarmName,
      namespace,
      metricName,
      dimensions,
    ] of alarms) {
      new cloudwatch.CfnAlarm(this, alarmId, {
        alarmName,
        namespace,
        metricName,
        dimensions: [...dimensions],
        statistic: 'Sum',
        period: 300,
        evaluationPeriods: 1,
        threshold: 1,
        comparisonOperator: 'GreaterThanOrEqualToThreshold',
        treatMissingData: 'notBreaching',
        alarmActions: [alarmTopic.ref],
      })
    }

    retainAll(this)
  }
}
