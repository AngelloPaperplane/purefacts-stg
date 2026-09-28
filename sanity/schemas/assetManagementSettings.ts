const industryCardFields = [
  { name: 'image',       title: 'Image',             type: 'image',  options: { hotspot: true } },
  { name: 'subtitle',    title: 'Subtitle / Eyebrow', type: 'string' },
  { name: 'title',       title: 'Title',              type: 'string', validation: (R: any) => R.required() },
  { name: 'description', title: 'Description',        type: 'text',   rows: 3, validation: (R: any) => R.required() },
  { name: 'linkUrl',     title: 'Link URL',            type: 'string' },
  { name: 'linkLabel',   title: 'Link Label',          type: 'string', initialValue: 'Learn more' },
]

const reasonCardFields = [
  { name: 'icon',        title: 'Icon',        type: 'image', description: 'Square icon image' },
  { name: 'title',       title: 'Title',       type: 'string', validation: (R: any) => R.required() },
  { name: 'description', title: 'Description', type: 'text',   rows: 3, validation: (R: any) => R.required() },
  { name: 'linkUrl',     title: 'Link URL',    type: 'string' },
  { name: 'linkLabel',   title: 'Link Label',  type: 'string', initialValue: 'Learn more' },
]

const assetManagementSettings = {
  name: 'assetManagementSettings',
  title: 'Asset Management Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo', title: 'SEO', type: 'seo' },
    {
      name: 'heroImage', title: 'Hero Image', type: 'image',
      options: { hotspot: true },
      description: 'Full-bleed right column image with gradient chevron overlay',
    },
    {
      name: 'clientLogos', title: 'Client Logos', type: 'array',
      of: [{ type: 'reference', to: [{ type: 'clientLogo' }] }],
    },
    {
      name: 'forceCards', title: 'Three Forces Cards',
      description: 'Compression, Collection, Complexity — 3-column grid',
      type: 'array',
      of: [{ type: 'object', name: 'forceCard', title: 'Force Card', fields: industryCardFields, preview: { select: { title: 'title' } } }],
    },
    {
      name: 'whyImage', title: 'Why Asset Managers Image', type: 'image',
      options: { hotspot: true },
      description: 'Image beside "Why Asset Managers Choose PureFacts" (e.g. $525M recovered)',
    },
    {
      name: 'caseStudyUrl', title: 'Case Study URL', type: 'string',
      description: 'Link for the "Read the case study" button',
    },
    {
      name: 'integrityCards', title: 'Revenue Integrity Cards',
      description: '2×2 grid: Standardised Fee Logic, Governed Rebate Flows, Cross-Entity Controls, Single Revenue Book Of Record',
      type: 'array',
      of: [{ type: 'object', name: 'integrityCard', title: 'Integrity Card', fields: reasonCardFields, preview: { select: { title: 'title' } } }],
    },
    {
      name: 'integrityImage', title: 'Governed Revenue Integrity Image', type: 'image',
      options: { hotspot: true },
      description: 'Image beside "From Fragmented Fee Logic To Governed Revenue Integrity"',
    },
    {
      name: 'ctaImage', title: 'CTA Band People Image', type: 'image',
      options: { hotspot: true },
      description: 'Photo that slides in from the left of the dark CTA band',
    },
  ],
}

export default assetManagementSettings