const newsroomSettings = {
  name: 'newsroomSettings',
  title: 'Newsroom Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'awards',
      title: 'Awards',
      description: 'All awards displayed on the Newsroom page. Drag to reorder, or use the Order field to set position manually.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'award',
          title: 'Award',
          fields: [
            {
              name: 'order',
              title: 'Order',
              type: 'number',
              description: 'Display order (lower numbers appear first). Drag-to-reorder in the array also works.',
              validation: (R: any) => R.required().integer().min(1),
            },
            {
              name: 'image',
              title: 'Award Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Badge, logo, or certificate image for the award.',
              validation: (R: any) => R.required(),
            },
            {
              name: 'provider',
              title: 'Award Provider',
              type: 'string',
              description: 'Organisation that gave the award (e.g. CRN, AIFinTech100).',
              validation: (R: any) => R.required(),
            },
            {
              name: 'title',
              title: 'Award Title',
              type: 'string',
              description: 'Name of the award (e.g. Channel Chiefs).',
              validation: (R: any) => R.required(),
            },
            {
              name: 'year',
              title: 'Year',
              type: 'number',
              description: 'Year the award was received.',
              validation: (R: any) =>
                R.required().min(2000).max(2100).integer(),
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'provider',
              year: 'year',
              order: 'order',
              media: 'image',
            },
            prepare(selection: any) {
              const { title, subtitle, year, order, media } = selection
              return {
                title: `${order ? `#${order} · ` : ''}${title}`,
                subtitle: `${subtitle} · ${year}`,
                media,
              }
            },
          },
        },
      ],
    },
  ],
}

export default newsroomSettings