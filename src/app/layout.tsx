import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import type { WebSite, WithContext } from "schema-dts";

import Script from "next/script";
import { absoluteUrl } from "@/lib/utils";
import { fontVariables } from "@/lib/fonts";
import { JsonLdScript } from "@/lib/json-ld";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { USER } from "@/features/portfolio/data/user";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { META_THEME_COLORS, SITE_INFO, X_HANDLE } from "@/config/site";

function getWebSiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_INFO.name,
    url: SITE_INFO.url,
    alternateName: [USER.username],
  };
}

// Thanks @shadcn-ui, @tailwindcss
const darkModeScript = `
  try {
    if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
    }
  } catch (_) {}

  try {
    if (localStorage.getItem('brand-colors') === 'false') {
      document.documentElement.dataset.brandColors = 'false'
    }
  } catch (_) {}

  try {
    if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
      document.documentElement.classList.add('os-macos')
    }
  } catch (_) {}
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  title: {
    template: `%s – ${SITE_INFO.name}`,
    default: `${USER.displayName} – ${USER.jobTitle}`,
  },
  description: SITE_INFO.description,
  keywords: SITE_INFO.keywords,
  authors: [
    {
      name: "yash14",
      url: SITE_INFO.url,
    },
  ],
  creator: "yash14",
  openGraph: {
    siteName: SITE_INFO.name,
    url: "/",
    type: "profile",
    locale: "en-IN",
    firstName: USER.firstName,
    lastName: USER.lastName,
    username: USER.username,
    gender: USER.gender,
    images: [
      {
        url: SITE_INFO.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_INFO.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: X_HANDLE,
    creator: X_HANDLE,
    images: [SITE_INFO.ogImage],
  },
  icons: {
    icon: [
      {
        url: absoluteUrl("/logo/favicon.ico"),
        sizes: "48x48",
      },
      {
        url: absoluteUrl("/logo/favicon.png"),
        sizes: "512x512",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: absoluteUrl("/logo/favicon-dark.png"),
        sizes: "512x512",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: {
      url: absoluteUrl("/logo/apple-touch-icon.png"),
      type: "image/png",
      sizes: "180x180",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: META_THEME_COLORS.light,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <meta
          name="dmca-site-verification"
          content="VjlScmVBWUZLbFl2Tmk0anYwZ2UrUT090"
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: darkModeScript }}
        />
        {/*
          Thanks @tailwindcss. We inject the script via the `<Script/>` tag again,
          since we found the regular `<script>` tag to not execute when rendering a not-found page.
         */}
        <Script src={`data:text/javascript;base64,${btoa(darkModeScript)}`} />
        <JsonLdScript data={getWebSiteJsonLd()} />
      </head>

      <body>
        <Providers>
          <NuqsAdapter>{children}</NuqsAdapter>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
