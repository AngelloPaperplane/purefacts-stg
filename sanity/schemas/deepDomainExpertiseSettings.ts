// ── deepDomainExpertiseSettings.ts ───────────────────────────────────────────
const deepDomainExpertiseSettings = {
  name: 'deepDomainExpertiseSettings',
  title: 'Deep Domain Expertise Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                         type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',                  type: 'image', options: { hotspot: true } },
    { name: 'expertiseImage',     title: 'Why Expertise Matters Image', type: 'image', options: { hotspot: true } },
    { name: 'platformImage',      title: 'Expertise In Platform Image', type: 'image', options: { hotspot: true } },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image',     type: 'image', options: { hotspot: true } },
  ],
}

export default deepDomainExpertiseSettings