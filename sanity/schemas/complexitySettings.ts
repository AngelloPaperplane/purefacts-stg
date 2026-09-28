// ── complexitySettings.ts ────────────────────────────────────────────────────
const complexitySettings = {
  name: 'complexitySettings',
  title: 'Complexity Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                 type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',           type: 'image', options: { hotspot: true } },
    { name: 'problemImage',       title: 'Problem Split Image',  type: 'image', options: { hotspot: true }, description: 'Image beside "Complexity Weakens Trust, Not Just Efficiency"' },
    { name: 'solutionImage',      title: 'Solution Split Image', type: 'image', options: { hotspot: true }, description: 'Image beside "What Firms Gain When They Reduce Revenue Complexity"' },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image', type: 'image', options: { hotspot: true } },
  ],
}

export default complexitySettings