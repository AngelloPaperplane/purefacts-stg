// ─────────────────────────────────────────────
// sanity/schemas/objects/seo.ts
// ─────────────────────────────────────────────
export const seoObject = {
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    { name: 'title',       title: 'Meta Title',       type: 'string' },
    { name: 'description', title: 'Meta Description', type: 'text', rows: 2 },
    { name: 'ogImage',     title: 'OG Image',         type: 'image', description: 'Recommended: 1200×630px' },
    { name: 'noIndex',     title: 'No Index',         type: 'boolean', initialValue: false },
  ],
}