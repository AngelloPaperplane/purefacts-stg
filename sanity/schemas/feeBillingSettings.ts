const feeBillingSettings = {
  name: 'feeBillingSettings',
  title: 'Fee Billing Settings',
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
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'problemImage',
      title: 'Problem Split Image',
      description: 'Image beside "Billing Is Not Back Office..."',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'solutionImage',
      title: 'Solution Split Image',
      description: 'Image beside "What Changes When Billing Is Done Right"',
      type: 'image',
      options: { hotspot: true },
    },
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

export default feeBillingSettings