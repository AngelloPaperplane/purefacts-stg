// ─────────────────────────────────────────────
// sanity/schemas/post.ts
// ─────────────────────────────────────────────
const post = {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    { name: 'title',       title: 'Title',       type: 'string',   validation: (R: any) => R.required() },
    { name: 'slug',        title: 'Slug',        type: 'slug',     options: { source: 'title', maxLength: 96 }, validation: (R: any) => R.required() },
    { name: 'category',    title: 'Category',    type: 'reference', to: [{ type: 'category' }], validation: (R: any) => R.required(), description: 'Determines the URL: /blog/, /case-study/, /whitepaper/, etc.' },
    { name: 'topics',      title: 'Topics',      type: 'array',    of: [{ type: 'reference', to: [{ type: 'topic' }] }] },
    { name: 'author',      title: 'Author',      type: 'reference', to: [{ type: 'author' }] },
    { name: 'publishedAt', title: 'Published At', type: 'datetime', validation: (R: any) => R.required() },
    { name: 'featured',    title: 'Featured',    type: 'boolean',  initialValue: false },
    { name: 'excerpt',     title: 'Excerpt',     type: 'text',     rows: 3 },
    { name: 'coverImage',  title: 'Cover Image', type: 'image',    options: { hotspot: true } },
    { name: 'audioFile',   title: 'Audio Version', type: 'file',
      description: 'Upload an MP3 to enable the "Listen to this article" player. Leave empty to hide the player.',
      options: { accept: 'audio/mpeg,audio/mp3' },
    },
    { name: 'body',        title: 'Body',        type: 'array',    of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] },
    { name: 'faqs', title: 'FAQs', type: 'array', of: [{
      type: 'object',
      fields: [
        { name: 'question', title: 'Question', type: 'string' },
        { name: 'answer',   title: 'Answer',   type: 'text', rows: 3 },
      ],
      preview: { select: { title: 'question' } },
    }]},
    { name: 'clientProfile', title: 'Client Profile', type: 'object', fields: [
      { name: 'logo',        title: 'Company Logo',    type: 'image', options: { hotspot: true } },
      { name: 'companyName', title: 'Company Name',    type: 'string', description: 'Leave blank for anonymized case studies' },
      { name: 'profileLine', title: 'Profile Byline',  type: 'string', description: 'e.g. A Luxembourg-headquartered European fund administrator with €150B+ AUA' },
    ]},
    { name: 'template', title: 'Template', type: 'string',
      description: 'Default uses the standard post layout. Custom renders a bespoke coded template.',
      options: { list: [
        { title: 'Default', value: 'default' },
        { title: 'Custom',  value: 'custom' },
      ]},
      initialValue: 'default'
    },
    { name: 'seo',         title: 'SEO',         type: 'seo' },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category.title', media: 'coverImage' },
  },
}

export default post