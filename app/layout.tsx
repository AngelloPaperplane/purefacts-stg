import type { Metadata } from 'next'
import { Carlito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import './globals.css'
import Script from 'next/script'

const carlito = Carlito({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-carlito',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://purefacts.com'),
  title: {
    default: 'Revenue Optimization for Financial Services | PureFacts',
    template: '%s | PureFacts',
  },
  description:
    'PureFacts delivers enterprise revenue management software for wealth managers, asset managers and asset servicers. Fee billing, advisor compensation and revenue intelligence on one platform.',
  openGraph: {
    siteName: 'PureFacts',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={carlito.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TK9F36MJ');`}
        </Script>
        {/* Start of HubSpot Embed Code */}
          <script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/3218774.js"></script>
        {/* End of HubSpot Embed Code */}
      </head>
      <body className="bg-white font-sans text-brand-off-black antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TK9F36MJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <ConditionalLayout>{children}</ConditionalLayout>
        <Analytics />
      </body>
    </html>
  )
}