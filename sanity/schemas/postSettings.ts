// ─────────────────────────────────────────────
// sanity/schemas/postSettings.ts
// ─────────────────────────────────────────────
const postSettings = {
  name: 'postSettings',
  title: 'Post Sidebar Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'imageCtas',
      title: 'Image CTAs',
      description: 'Image-based CTA cards shown at the top of the sidebar. Add as many as needed.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'image',    title: 'Image',       type: 'image', options: { hotspot: true } },
          { name: 'altText',  title: 'Alt Text',    type: 'string' },
          { name: 'linkUrl',  title: 'Link URL',    type: 'string', description: 'Internal path (e.g. /resources) or full external URL' },
          { name: 'openInNewTab', title: 'Open in new tab', type: 'boolean', initialValue: false },
        ],
        preview: { select: { title: 'linkUrl', media: 'image' } },
      }],
    },
    {
      name: 'textCtas',
      title: 'Text CTAs',
      description: 'Text-based CTA cards shown below image CTAs in the sidebar.',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'eyebrow',     title: 'Eyebrow',      type: 'string', description: 'Small label above headline (optional)' },
          { name: 'headline',    title: 'Headline',     type: 'string' },
          { name: 'description', title: 'Description',  type: 'text', rows: 2 },
          { name: 'linkLabel',   title: 'Button Label', type: 'string' },
          { name: 'linkUrl',     title: 'Link URL',     type: 'string' },
          { name: 'openInNewTab', title: 'Open in new tab', type: 'boolean', initialValue: false },
        ],
        preview: { select: { title: 'headline' } },
      }],
    },
    {
        name: 'bottomCta',
        title: 'Case Study Bottom CTA',
        description: 'Full-width CTA band shown at the bottom of case study pages.',
        type: 'object',
        fields: [
            { name: 'title',      title: 'Title',        type: 'string' },
            { name: 'linkLabel',  title: 'Button Label', type: 'string' },
            { name: 'linkUrl',    title: 'Link URL',     type: 'string' },
        ],
    },
  ],
  preview: {
    prepare() {
      return { title: 'Post Sidebar Settings' }
    },
  },
}

export default postSettings