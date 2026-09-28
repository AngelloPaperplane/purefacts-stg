const threeColumnCardFields = [
  {
    name: 'image',
    title: 'Card Image',
    type: 'image',
    options: { hotspot: true },
  },
  {
    name: 'subtitle',
    title: 'Subtitle / Eyebrow',
    type: 'string',
    description: 'Small label above the title e.g. "Scale without operational drag."',
  },
  {
    name: 'title',
    title: 'Title',
    type: 'string',
    validation: (R: any) => R.required(),
  },
  {
    name: 'description',
    title: 'Description',
    type: 'text',
    rows: 4,
    validation: (R: any) => R.required(),
  },
  {
    name: 'linkUrl',
    title: 'Link URL',
    type: 'string',
    description: 'Internal path e.g. /who-we-serve/wealth-management',
  },
  {
    name: 'linkLabel',
    title: 'Link Label',
    type: 'string',
    initialValue: 'Learn more',
  },
]

const whoWeServeSettings = {
  name: 'whoWeServeSettings',
  title: 'Who We Serve Settings',
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
      description: 'Full-bleed image on the right side of the hero',
    },
    // ── Industry cards (3-col) ─────────────────────────────
    {
      name: 'industryCards',
      title: 'Industry Cards',
      description: '3-column grid: Wealth Management, Asset Management, Asset Servicing',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'industryCard',
          title: 'Industry Card',
          fields: threeColumnCardFields,
          preview: { select: { title: 'title', subtitle: 'subtitle' } },
        },
      ],
    },
    // ── Pull quote / whitepaper band ───────────────────────
    {
      name: 'pullQuote',
      title: 'Pull Quote Text',
      type: 'text',
      rows: 3,
      description: 'The large centred quote text between the two card grids',
    },
    {
      name: 'pullQuoteLinkLabel',
      title: 'Pull Quote CTA Label',
      type: 'string',
      initialValue: 'Read the whitepaper',
    },
    {
      name: 'pullQuoteLinkUrl',
      title: 'Pull Quote CTA URL',
      type: 'string',
      description: 'Internal path or external URL',
    },
    // ── Persona cards (3-col) ──────────────────────────────
    {
      name: 'personaCards',
      title: 'Persona Cards',
      description: '3-column grid: Executives, Finance, Operations, Business Development, Risk & Compliance',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'personaCard',
          title: 'Persona Card',
          fields: threeColumnCardFields,
          preview: { select: { title: 'title', subtitle: 'subtitle' } },
        },
      ],
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

export default whoWeServeSettings