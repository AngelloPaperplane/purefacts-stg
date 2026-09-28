const homepageSettings = {
  name: 'homepageSettings',
  title: 'Homepage Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'clientLogo' }] }],
      description: 'Logos shown in the carousel on the homepage',
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    },
    {
      name: 'pureferesImage',
      title: 'PureFees Product Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'purerewardsImage',
      title: 'PureRewards Product Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'purereportsImage',
      title: 'PureReports Product Image',
      type: 'image',
      options: { hotspot: true },
    },
  ],
}

export default homepageSettings