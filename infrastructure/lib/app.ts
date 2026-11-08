import { App, DefaultStackSynthesizer } from 'aws-cdk-lib'
import { ENV } from './config'
import { GithubStack } from './github-stack'
import { SiteStack } from './site-stack'

export function buildApp(): { app: App; site: SiteStack; github: GithubStack } {
  const app = new App({ analyticsReporting: false })
  const props = { env: ENV, terminationProtection: true }
  // Imports omit unused bootstrap parameters; keep these asset-free templates identical.
  const site = new SiteStack(app, 'V15vSite', {
    ...props,
    synthesizer: new DefaultStackSynthesizer({
      generateBootstrapVersionRule: false,
    }),
  })
  const github = new GithubStack(app, 'V15vGithub', {
    ...props,
    synthesizer: new DefaultStackSynthesizer({
      generateBootstrapVersionRule: false,
    }),
  })
  return { app, site, github }
}
