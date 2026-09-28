// ─────────────────────────────────────────────
// sanity/schemas/author.ts
// ─────────────────────────────────────────────
const author = {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    { name: 'name',     title: 'Name',      type: 'string', validation: (R: any) => R.required() },
    { name: 'slug',     title: 'Slug',      type: 'slug',   options: { source: 'name' } },
    { name: 'photo',    title: 'Photo',     type: 'image',  options: { hotspot: true } },
    { name: 'bio',      title: 'Bio',       type: 'text',   rows: 3 },
    { name: 'jobTitle', title: 'Job Title', type: 'string' },
    { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'photo',
    },
  },
}

export default author