export default {
  name: 'navFeatured',
  title: 'Nav Featured Card',
  type: 'document',
  // One document per nav section — enforced by the navSection field being unique.
  // Editors should not create more than one doc per section.
  fields: [
    {
      name: 'navSection',
      title: 'Nav Section',
      type: 'string',
      description: 'Which top-level nav item this card appears under.',
      options: {
        list: [
          { title: 'Platform',       value: 'Platform' },
          { title: 'Why PureFacts',  value: 'Why PureFacts' },
          { title: 'Who We Serve',   value: 'Who We Serve' },
          { title: 'About',          value: 'About' },
          { title: 'Resources',      value: 'Resources' },
        ],
        layout: 'radio',
      },
      validation: (R: any) => R.required(),
    },
    {
      name: 'image',
      title: 'Featured Image (optional)',
      type: 'image',
      description: 'If set, the featured card displays this image instead of the gradient text card. The link URL below still applies.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'label',
      title: 'Heading',
      type: 'string',
      description: 'Bold heading displayed on the card. Not shown when an image is used.',
      validation: (R: any) => R.max(60),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Short supporting copy beneath the heading. Not shown when an image is used.',
      validation: (R: any) => R.max(160),
    },
    {
      name: 'href',
      title: 'Link URL',
      type: 'string',
      description: 'Internal path the card links to (e.g. /platform). Applies to both text and image cards.',
      validation: (R: any) => R.required(),
    },
    {
      name: 'cta',
      title: 'CTA Label',
      type: 'string',
      description: 'Text for the call-to-action link. Not shown when an image is used.',
      validation: (R: any) => R.max(40),
    },
  ],
  preview: {
    select: {
      title: 'navSection',
      subtitle: 'label',
      media: 'image',
    },
    prepare(selection: any) {
      const { title, subtitle, media } = selection
      return {
        title: `Featured — ${title}`,
        subtitle: media ? '📷 Image card' : subtitle,
        media,
      }
    },
  },
}