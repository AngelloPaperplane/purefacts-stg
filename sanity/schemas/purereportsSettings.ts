const purereportsSettings = {
  name: 'purereportsSettings',
  title: 'PureReports Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      description: 'Product screenshot shown in the hero section',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'problemImage',
      title: 'Problem Split Image',
      description: 'Image shown beside the problem/pain section',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'complexityImage',
      title: 'Complexity Split Image',
      description: 'Dashboard screenshot in the complexity/clarity section',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'analyticsImage',
      title: 'Analytics Split Image',
      description: 'Image shown beside the insights/analytics section',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'ctaBackgroundImage',
      title: 'CTA Band Background Image',
      description: 'Background image behind the Quick Summary CTA band',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'onePagerUrl',
      title: 'One-Pager Download URL',
      description: 'Link to the downloadable PDF one-pager',
      type: 'url',
    },
    {
      name: 'featureGridTitle',
      title: 'Feature Grid Headline',
      type: 'string',
    },
    {
      name: 'featureCards',
      title: 'Feature Cards',
      type: 'array',
      of: [{ type: 'featureCard' }],
      description: 'Up to 6 cards shown in the feature grid',
      validation: (R: any) => R.max(6),
    },
    {
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'clientLogo' }] }],
      description: 'Logos shown in the carousel on the PureReports page',
    },
  ],
}

export default purereportsSettings