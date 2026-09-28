const careersSettings = {
  name: 'careersSettings',
  title: 'Careers Page Settings',
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
      name: 'acrosticImage',
      title: 'Culture Code Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown below the PUREFACTS headline in the left column of the acrostic section.',
    },
    {
      name: 'operatingImage',
      title: 'Operating Code Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image beside "Our Operating Code: How We Move Forward".',
    },
  ],
}

export default careersSettings