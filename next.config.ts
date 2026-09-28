import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'purefacts.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
    ]
  },
  async redirects() {
    return [

      // ─── Products ─────────────────────────────────────────
      { source: '/platform/purefees', destination: '/platform/fees-and-billing', permanent: true },
      { source: '/platform/purerewards', destination: '/platform/compensation', permanent: true },
      { source: '/platform/purereports', destination: '/platform/practice-management', permanent: true },

      // ─── About ────────────────────────────────────────────
      { source: '/about-purefacts', destination: '/about', permanent: true },
      { source: '/about-purefacts/:path*', destination: '/about/:path*', permanent: true },

      // ─── Solutions → Why PureFacts ────────────────────────
      { source: '/solutions', destination: '/why-purefacts', permanent: true },
      { source: '/solutions/fee-billing', destination: '/why-purefacts/fee-billing', permanent: true },
      { source: '/solutions/compensation-and-incentives', destination: '/why-purefacts/compensation-and-incentives', permanent: true },
      { source: '/solutions/insights-and-analytics', destination: '/why-purefacts/insights-and-analytics', permanent: true },

      // ─── Revenue Strategy sub-pages ───────────────────────
      { source: '/why-purefacts/revenue-strategy/revenue-performance-analysis', destination: '/why-purefacts/revenue-strategy', permanent: true },
      { source: '/why-purefacts/revenue-strategy/business-needs-analysis', destination: '/why-purefacts/revenue-strategy', permanent: true },

      // ─── Privacy ──────────────────────────────────────────
      { source: '/privacy', destination: '/privacy-policy', permanent: true },

      // ─── Misc ─────────────────────────────────────────────
      { source: '/topic', destination: '/resources', permanent: true },
      { source: '/blog', destination: '/resources', permanent: true },
      { source: '/qfs', destination: '/press-release/purefacts-acquires-quartal-financial-solutions-to-become-a-global-wealthtech-leader', permanent: true,},
      { source: '/why-purefacts/insights-and-analytics', destination: '/why-purefacts/practice-management', permanent: true, },
      { source: "/:path*", has: [{ type: "host", value: "www.purefacts.com" }], destination: "https://purefacts.com/:path*", permanent: true, },

      // ─── Blog posts ───────────────────────────────────────
      ...[
        'organic-growth-in-the-advice-industry',
        'who-is-purefacts',
        'revenue-optimization-profitable-growth',
        'revenue-leakage-fixing-hidden-loss',
        'underinvestment-cfo-revenue-growth',
        'how-fragmentation-erodes-growth',
        'revenue-spillage-money-lost-before-it-even-starts',
        'why-billing-is-now-a-growth-lever-in-wealth-asset-management',
        'why-advisor-compensation-is-a-strategic-growth-lever',
        'revenue-leakage-has-become-a-top-priority-for-cfos-in-2025',
        'is-your-advisor-compensation-system-costing-you-millions-the-hidden-impact-on-your-bottom-line',
        '25-ways-your-incentive-compensation-programs-can-be-leaking-profits-from-your-wealth-management-business',
        'how-leakage-in-incentive-compensation-programs-impacts-profits',
        'empower-advisors-to-tackle-tough-fee-conversations',
        'ignite-advisor-access-with-a-transformative-app',
        'deliver-a-superior-client-experience-online-and-in-print',
        'simpler-faster-implementations-for-enhanced-client-statements-powered-by-microsoft-azure',
        'building-a-better-future-the-impact-of-purefacts-purepossibilities-program-in-2022',
        'purefacts-2022-a-look-back',
        'purefacts-launches-program-for-sustainable-and-meaningful-community-growth',
        'robert-madej-at-techexit-io-closing-acquisitions-during-uncertain-times',
        'enterprise-software-upgrade-data-conversion-two-major-projects-one-big-success',
      ].map(slug => ({ source: `/${slug}`, destination: `/blog/${slug}`, permanent: true })),

      // ─── Case studies ─────────────────────────────────
      ...[
        'european-fund-administrator-data-driven-pricing',
        'asset-manager-billing-cycle-time',
        'how-a-leading-wealth-manager-unlocked-over-13m-in-annual-value-by-replacing-legacy-infrastructure',
        'how-a-leading-european-financial-institution-unlocked-e1m-in-value-and-modernized-fee-operations',
        'professional-services-tackling-complex-purefees-implementation-with-rbc',
      ].map(slug => ({ source: `/${slug}`, destination: `/case-study/${slug}`, permanent: true })),

      // ─── Whitepapers ──────────────────────────────────────
      ...[
        'value-destruction-in-wealth-management',
        'the-architecture-of-alignment',
        'preventing-revenue-spillage-in-wealth-management',
        'regulatory-fines-wealth-management-costs',
      ].map(slug => ({ source: `/${slug}`, destination: `/whitepaper/${slug}`, permanent: true })),

      // ─── Press releases ───────────────────────────────────
      ...[
        'capco-and-purefacts-announce-strategic-partnership',
        'purefacts-financial-solutions-to-enhance-revenue-management-capabilities-with-bny-pershing',
        'celebrating-our-own-jennifer-bouyoukos-honoured-on-hrd-canadas-2025-elite-women-list',
        'purefacts-announces-executive-appointments',
        'capital-investment-companies-selects-purefacts-fee-billing-product-purefees-to-scale-their-business',
        'purefacts-announces-majority-investment-from-growthcurve-capital-to-accelerate-growth',
        'vestmark-and-purefacts-announce-partnership-to-transform-wealth-and-investment-management-billing-at-scale',
        'purefacts-announces-acquisition-of-xtiva-financial-systems',
        'purefacts-acquires-quartal-financial-solutions-to-become-a-global-wealthtech-leader',
        'purefacts-revenue-management-platform-selected-by-gwk',
      ].map(slug => ({ source: `/${slug}`, destination: `/press-release/${slug}`, permanent: true })),

      // ─── News ─────────────────────────────────────────────
      ...[
        'optimising-revenue-management-research-paper',
        'wealthmosaic-ria-toolkit-2026',
        'purefacts-bolsters-c-suite-with-trio-of-powerhouse-hires',
        'purefacts-names-fintech-veteran-pete-hess-as-president',
        'data-enrichment-a-partnership-between-purefacts-and-bridgeft',
        'purefacts-was-awarded-wealthtech100-innovation-leader',
        'purefacts-recognized-as-a-must-know-company-in-global-esgfintech100-2022-list',
        'purefacts-has-been-named-to-the-aifintech100-list-by-fintech-global',
        'how-purefacts-is-looking-to-revolutionize-wealth-management-for-all',
        'purefacts-partners-with-futurevault-to-securely-automate-delivery-of-financial-statements',
        'purefacts-supports-university-of-guelph-with-undergraduate-scholarships',
        'purefacts-closes-20-million-financing-round',
      ].map(slug => ({ source: `/${slug}`, destination: `/news/${slug}`, permanent: true })),

      // ─── Awards ───────────────────────────────────────────
      ...[
        'purefacts-named-to-the-culture-100-award-list',
        'purefacts-featured-in-the-2025-aifintech100-list',
        'purefacts-named-to-the-wealthtech100-a-continued-legacy-of-excellence',
        'purefacts-featured-on-the-aifintech100-list-2',
        'purefacts-selected-to-the-wealthtech100-for-2024',
      ].map(slug => ({ source: `/${slug}`, destination: `/awards/${slug}`, permanent: true })),
    ]
  },
}

export default withBundleAnalyzer(nextConfig)