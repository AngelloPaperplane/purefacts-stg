const whyPurefactsSettings = {
  name: 'whyPurefactsSettings',
  title: 'Why PureFacts Settings',
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
    },
    // ── Problem split ──────────────────────────────────────
    {
      name: 'problemImage',
      title: 'Problem Split Image',
      description: 'Image beside "Revenue Systems Were Never Designed For Today\'s Reality"',
      type: 'image',
      options: { hotspot: true },
    },
    // ── Infrastructure split ───────────────────────────────
    {
      name: 'infrastructureImage',
      title: 'Infrastructure Split Image',
      description: 'Image beside "What Changes When Revenue Is Treated As Infrastructure"',
      type: 'image',
      options: { hotspot: true },
    },
    // ── CTA band ──────────────────────────────────────────
    // Note: ctaBackgroundImage is kept for an optional overlay effect on the gradient.
    // If unused in the design, this field can be safely removed.
    {
      name: 'ctaBackgroundImage',
      title: 'CTA Band — People Image',
      description:
        'Photo of people (e.g. two professionals walking) that slides in from the left of the dark CTA band.',
      type: 'image',
      options: { hotspot: true },
    },
    // ── Why Revenue Leaders cards ──────────────────────────
    {
      name: 'reasonCardsHeadline',
      title: 'Cards Section Headline',
      type: 'string',
      description: 'e.g. "Why Revenue Leaders Choose PureFacts"',
    },
    {
      name: 'reasonCardsSubheadline',
      title: 'Cards Section Subheadline',
      type: 'string',
      description:
        'e.g. "Because revenue performance demands enterprise-grade control, not point solutions"',
    },
    {
      name: 'reasonCards',
      title: 'Reason Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'reasonCard',
          title: 'Reason Card',
          fields: [
            {
              name: 'icon',
              title: 'Icon',
              type: 'image',
              description: 'Square icon image for this card',
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
              rows: 3,
              validation: (R: any) => R.required(),
            },
            {
              name: 'linkUrl',
              title: 'Learn More URL',
              type: 'string',
              description: 'Internal path e.g. /platform/fees-and-billing',
            },
            {
              name: 'linkLabel',
              title: 'Link Label',
              type: 'string',
              initialValue: 'Learn more',
            },
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        },
      ],
      description: 'Cards shown in the 2-column grid',
    },
    // ── Client logos ───────────────────────────────────────
    // Retained in schema in case other pages reference this document type,
    // but the LogoCarousel is no longer rendered on this page.
    {
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'clientLogo' }] }],
    },
  ],
}

export default whyPurefactsSettings