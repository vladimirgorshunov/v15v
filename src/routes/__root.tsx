import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { Navigation } from '@/components/Navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

import globalCss from '@/styles/global.css?url'
import resetCss from '@/styles/reset.css?url'
import tokensCss from '@/styles/tokens.css?url'

const RootDocument = ({ children }: { children: React.ReactNode }) => {
  const themeScript = `(() => {
  try {
    const key = 'v15v-theme';
    const stored = window.localStorage.getItem(key);
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#1b1712' : '#4DBA87');
    }
  } catch (e) {}
})();`

  return (
    <html data-theme="light" lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <div id="app">
          <ThemeToggle />
          <Navigation />
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  )
}

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
        content: '#FFFFFF',
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
        color: '#FFFFFF',
      },
    ],
  }),
  shellComponent: RootDocument,
})
