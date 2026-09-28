const wealthManagementSettings = {
  name: 'wealthManagementSettings',
  title: 'Wealth Management Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    },
    // ── Hero ──────────────────────────────────────────────
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-bleed right column image with gradient chevron overlay',
    },
    // ── Logo carousel ──────────────────────────────────────
    {
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'clientLogo' }] }],
    },
    // ── Three forces cards ─────────────────────────────────
    {
      name: 'forceCards',
      title: 'Three Forces Cards',
      description: 'Compression, Collection, Complexity — 3-column grid',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'forceCard',
          title: 'Force Card',
          fields: [
            { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
            { name: 'subtitle', title: 'Subtitle / Eyebrow', type: 'string' },
            { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
            { name: 'description', title: 'Description', type: 'text', rows: 3, validation: (R: any) => R.required() },
            { name: 'linkUrl', title: 'Link URL', type: 'string' },
            { name: 'linkLabel', title: 'Link Label', type: 'string', initialValue: 'Learn more' },
          ],
          preview: { select: { title: 'title', subtitle: 'subtitle' } },
        },
      ],
    },
    // ── Why Wealth Managers split ──────────────────────────
    {
      name: 'whyImage',
      title: 'Why Wealth Managers Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image beside the "Why Wealth Managers Choose PureFacts" section (e.g. $250M saved)',
    },
    // ── Case study pull quote ──────────────────────────────
    {
      name: 'caseStudyUrl',
      title: 'Case Study URL',
      type: 'string',
      description: 'Link for the "Read the case study" button in the pull quote band',
    },
    // ── Revenue Optimization cards (2×2) ──────────────────
    {
      name: 'optimizationCards',
      title: 'Revenue Optimization Cards',
      description: '2×2 grid: Standardised Fee Logic, Governed Compensation, End-To-End Operational Control, Single Revenue Book Of Record',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'optimizationCard',
          title: 'Optimization Card',
          fields: [
            { name: 'icon', title: 'Icon', type: 'image', description: 'Square icon image' },
            { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
            { name: 'description', title: 'Description', type: 'text', rows: 3, validation: (R: any) => R.required() },
            { name: 'linkUrl', title: 'Link URL', type: 'string' },
            { name: 'linkLabel', title: 'Link Label', type: 'string', initialValue: 'Learn more' },
          ],
          preview: { select: { title: 'title' } },
        },
      ],
    },
    // ── Revenue Spillage split ─────────────────────────────
    {
      name: 'spillageImage',
      title: 'Revenue Spillage Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image beside "From Revenue Spillage To Revenue Discipline"',
    },
    // ── CTA band ──────────────────────────────────────────
    {
      name: 'ctaImage',
      title: 'CTA Band People Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Photo that slides in from the left of the dark CTA band',
    },
  ],
}

export default wealthManagementSettings