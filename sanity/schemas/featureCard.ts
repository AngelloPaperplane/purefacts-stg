const featureCard = {
  name: 'featureCard',
  title: 'Feature Card',
  type: 'object',
  fields: [
    {
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'SVG or PNG icon shown on the front of the card',
      options: { hotspot: false },
    },
    {
      name: 'category',
      title: 'Category Label',
      type: 'string',
      description: 'Small uppercase label shown above the title (e.g. FEES, EFFICIENCY)',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Shown on both the front and back of the card',
      validation: (R: any) => R.required(),
    },
    {
      name: 'bulletOne',
      title: 'Bullet Point 1',
      type: 'string',
      validation: (R: any) => R.required(),
    },
    {
      name: 'bulletTwo',
      title: 'Bullet Point 2',
      type: 'string',
    },
    {
      name: 'bulletThree',
      title: 'Bullet Point 3',
      type: 'string',
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category' },
  },
}

export default featureCard