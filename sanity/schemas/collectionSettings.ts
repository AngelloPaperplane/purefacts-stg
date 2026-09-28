// ── collectionSettings.ts ────────────────────────────────────────────────────
const collectionSettings = {
  name: 'collectionSettings',
  title: 'Collection Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                 type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',           type: 'image', options: { hotspot: true } },
    { name: 'problemImage',       title: 'Problem Split Image',  type: 'image', options: { hotspot: true }, description: 'Image beside "Collection Problems Begin With Fragmentation"' },
    { name: 'solutionImage',      title: 'Solution Split Image', type: 'image', options: { hotspot: true }, description: 'Image beside "A Governed Revenue Process..."' },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image', type: 'image', options: { hotspot: true } },
  ],
}

export default collectionSettings