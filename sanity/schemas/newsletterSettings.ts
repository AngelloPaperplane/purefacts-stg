const newsletterSettings = {
  name: 'newsletterSettings',
  title: 'Newsletter Page Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    },
    {
      name: 'featureImage',
      title: 'Feature Image',
      description: 'Illustration or photo displayed beside the subscription pitch (top section).',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'ctaBackgroundImage',
      title: 'CTA Band — People Image',
      description: 'Photo of people that slides in from the left of the dark subscription band.',
      type: 'image',
      options: { hotspot: true },
    },
  ],
}

export default newsletterSettings