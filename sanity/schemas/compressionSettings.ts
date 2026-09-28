// ── compressionSettings.ts ───────────────────────────────────────────────────
const compressionSettings = {
  name: 'compressionSettings',
  title: 'Compression Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                 type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',           type: 'image', options: { hotspot: true } },
    { name: 'problemImage',       title: 'Problem Split Image',  type: 'image', options: { hotspot: true }, description: 'Image beside "Compression Is A Business Model Problem..."' },
    { name: 'solutionImage',      title: 'Solution Split Image', type: 'image', options: { hotspot: true }, description: 'Image beside "Defend Margin With Structure, Not Willpower"' },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image', type: 'image', options: { hotspot: true } },
  ],
}

export default compressionSettings