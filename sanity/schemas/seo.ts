const seo = {
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    {
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Overrides the page title in search results. ~60 characters recommended.',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Summary shown in search results. ~155 characters recommended.',
    },
    {
      name: 'ogImage',
      title: 'OG Image',
      type: 'image',
      description: 'Social share image. 1200×630px recommended. Falls back to site default if empty.',
      options: { hotspot: true },
    },
    {
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'If enabled, this page will not be indexed by Google.',
      initialValue: false,
    },
  ],
}

export default seo