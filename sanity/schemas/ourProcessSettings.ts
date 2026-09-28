// ── ourProcessSettings.ts ────────────────────────────────────────────────────
const ourProcessSettings = {
  name: 'ourProcessSettings',
  title: 'Our Process Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                     type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',              type: 'image', options: { hotspot: true } },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image', type: 'image', options: { hotspot: true } },
  ],
}

export default ourProcessSettings