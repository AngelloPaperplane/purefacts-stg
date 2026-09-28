const siteSettings = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'siteTitle',       title: 'Site Title',       type: 'string' },
    { name: 'siteDescription', title: 'Site Description', type: 'text', rows: 2 },
    { name: 'defaultOgImage',  title: 'Default OG Image', type: 'image', description: 'Fallback for pages without a specific OG image' },
    { name: 'twitterHandle',   title: 'Twitter Handle',   type: 'string' },
    { name: 'linkedinUrl',     title: 'LinkedIn URL',     type: 'url' },
  ],
}

export default siteSettings