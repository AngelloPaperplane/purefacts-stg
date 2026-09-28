const workWithUsSettings = {
  name: 'workWithUsSettings',
  title: 'Work With Us Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                          type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',                   type: 'image', options: { hotspot: true } },
    { name: 'platformImage',      title: 'Platform Approach Image',      type: 'image', options: { hotspot: true } },
    { name: 'expertiseImage',     title: 'Domain Expertise Image',       type: 'image', options: { hotspot: true } },
    {
      name: 'clientLogos',
      title: 'Client Logos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'clientLogo' }] }],
      description: 'Logos shown in the carousel between the manifesto and pillars sections',
    },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image',      type: 'image', options: { hotspot: true } },
  ],
}

export default workWithUsSettings