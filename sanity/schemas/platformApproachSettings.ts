// ── platformApproachSettings.ts ──────────────────────────────────────────────
const platformApproachSettings = {
  name: 'platformApproachSettings',
  title: 'Platform Approach Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                     type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',              type: 'image', options: { hotspot: true } },
    { name: 'whyImage',           title: 'Why It Matters Image',    type: 'image', options: { hotspot: true } },
    { name: 'trustImage',         title: 'Built For Trust Image',   type: 'image', options: { hotspot: true } },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image', type: 'image', options: { hotspot: true } },
  ],
}

export default platformApproachSettings