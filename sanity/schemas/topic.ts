// ─────────────────────────────────────────────
// sanity/schemas/topic.ts
// ─────────────────────────────────────────────
const topic = {
  name: 'topic',
  title: 'Topic',
  type: 'document',
  fields: [
    { name: 'title',       title: 'Title',       type: 'string', validation: (R: any) => R.required() },
    { name: 'slug',        title: 'Slug',        type: 'slug',   options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'description', title: 'Description', type: 'text',   rows: 2 },
  ],
}

export default topic