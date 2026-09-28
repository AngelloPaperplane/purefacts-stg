const leadershipSettings = {
  name: 'leadershipSettings',
  title: 'Leadership Page Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-bleed right column image in the page hero.',
    },
    {
      name: 'leaders',
      title: 'Leadership Team',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'leader',
          title: 'Leader',
          fields: [
            {
              name: 'photo',
              title: 'Photo',
              type: 'image',
              options: { hotspot: true },
              validation: (R: any) => R.required(),
            },
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (R: any) => R.required(),
            },
            {
              name: 'title',
              title: 'Job Title',
              type: 'string',
              validation: (R: any) => R.required(),
            },
            {
              name: 'bio',
              title: 'Brief Bio',
              type: 'text',
              rows: 4,
            },
            {
              name: 'linkedinUrl',
              title: 'LinkedIn URL',
              type: 'url',
            },
          ],
          preview: {
            select: { title: 'name', subtitle: 'title', media: 'photo' },
          },
        },
      ],
    },
  ],
}

export default leadershipSettings