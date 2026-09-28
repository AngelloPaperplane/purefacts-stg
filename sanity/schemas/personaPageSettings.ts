// One shared schema registered three times under different names.
// Each instance is a separate singleton document in the Studio.

const cardFields = [
  { name: 'image',       title: 'Image',             type: 'image',  options: { hotspot: true } },
  { name: 'subtitle',    title: 'Subtitle / Eyebrow', type: 'string' },
  { name: 'title',       title: 'Title',              type: 'string', validation: (R: any) => R.required() },
  { name: 'description', title: 'Description',        type: 'text',   rows: 3, validation: (R: any) => R.required() },
  { name: 'linkUrl',     title: 'Link URL',            type: 'string' },
  { name: 'linkLabel',   title: 'Link Label',          type: 'string', initialValue: 'Learn more' },
]

const personaPageFields = [
  { name: 'seo',       title: 'SEO',       type: 'seo' },
  {
    name: 'heroImage', title: 'Hero Image', type: 'image',
    options: { hotspot: true },
    description: 'Full-bleed right column hero image',
  },
  {
    name: 'whyImage', title: '"Why This Matters" Image', type: 'image',
    options: { hotspot: true },
    description: 'Image beside the "Why This Matters" split section',
  },
  {
    name: 'pressureCards', title: 'Pressure Cards',
    description: '3-column grid: Complexity, Compression, Collection',
    type: 'array',
    of: [{
      type: 'object', name: 'pressureCard', title: 'Pressure Card',
      fields: cardFields,
      preview: { select: { title: 'title' } },
    }],
  },
  {
    name: 'solutionCards', title: 'How PureFacts Helps Cards',
    description: '3-column grid: Fee Billing, Advisor Compensation, Insights & Analytics',
    type: 'array',
    of: [{
      type: 'object', name: 'solutionCard', title: 'Solution Card',
      fields: cardFields,
      preview: { select: { title: 'title' } },
    }],
  },
  {
    name: 'ctaImage', title: 'CTA Band People Image', type: 'image',
    options: { hotspot: true },
    description: 'Photo that slides in from the left of the dark CTA band',
  },
]

export const headOfWealthSettings = {
  name: 'headOfWealthSettings',
  title: 'Head of Wealth Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: personaPageFields,
}

export const financeSettings = {
  name: 'financeSettings',
  title: 'Finance Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: personaPageFields,
}

export const operationsSettings = {
  name: 'operationsSettings',
  title: 'Operations Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: personaPageFields,
}