// sanity/schemas/clientLogo.ts
const clientLogo = {
  name: 'clientLogo',
  title: 'Client Logo',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Client Name',
      type: 'string',
      validation: (R: any) => R.required(),
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Upload with transparent background. SVG or PNG.',
      options: { hotspot: false },
      validation: (R: any) => R.required(),
    },
    {
      name: 'caseStudyUrl',
      title: 'Case Study URL',
      type: 'string',
      description: 'Optional. If set, the logo becomes a clickable link. Use internal slug e.g. /case-study/rbc or external https://...',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
    },
  },
}

export default clientLogo