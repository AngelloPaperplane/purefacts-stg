const compensationIncentivesSettings = {
  name: 'compensationIncentivesSettings',
  title: 'Compensation & Incentives Settings',
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
      description: 'Image beside "Weak Compensation Strategy Costs More Than You Think"',
      type: 'image',
      options: { hotspot: true },
    },
    // ── Solution split ─────────────────────────────────────
    {
      name: 'solutionImage',
      title: 'Solution Split Image',
      description: 'Image beside "Compensation Plans That Drive Profitable Behavior"',
      type: 'image',
      options: { hotspot: true },
    },
    // ── CTA band ──────────────────────────────────────────
    {
      name: 'ctaBackgroundImage',
      title: 'CTA Band — People Image',
      description:
        'Photo of people that slides in from the left of the dark CTA band.',
      type: 'image',
      options: { hotspot: true },
    },
  ],
}

export default compensationIncentivesSettings