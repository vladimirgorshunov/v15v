import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { Navigation } from '@/components/Navigation'

import globalCss from '@/styles/global.css?url'
import resetCss from '@/styles/reset.css?url'
import tokensCss from '@/styles/tokens.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Vladimir Gorshunov',
      },
      {
        name: 'description',
        content: 'Vladimir Gorshunov personal website and contact links.',
      },
      {
        name: 'theme-color',
        content: '#4DBA87',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'v15v',
      },
      {
        name: 'msapplication-TileColor',
        content: '#000000',
      },
      {
        name: 'msapplication-TileImage',
        content: '/static/img/icons/mstile-150x150.png',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: resetCss,
      },
      {
        rel: 'stylesheet',
        href: tokensCss,
      },
      {
        rel: 'stylesheet',
        href: globalCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/static/img/icons/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/static/img/icons/favicon-16x16.png',
      },
      {
        rel: 'shortcut icon',
        href: '/static/img/icons/favicon.ico',
      },
      {
        rel: 'manifest',
        href: '/static/manifest.json',
      },
      {
        rel: 'apple-touch-icon',
        href: '/static/img/icons/apple-touch-icon.png',
      },
      {
        rel: 'mask-icon',
        href: '/static/img/icons/safari-pinned-tab.svg',
        color: '#4DBA87',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="app">
          <Navigation />
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  )
}
