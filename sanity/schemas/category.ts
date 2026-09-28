// ─────────────────────────────────────────────
// sanity/schemas/category.ts
// ─────────────────────────────────────────────
const category = {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'title',       title: 'Title',       type: 'string', validation: (R: any) => R.required() },
    { name: 'slug',        title: 'Slug',        type: 'slug',   options: { source: 'title' }, description: 'Must match URL segment: blog, case-study, whitepaper, press-release, news, awards', validation: (R: any) => R.required() },
    { name: 'description', title: 'Description', type: 'text',   rows: 2 },
  ],
}

export default category