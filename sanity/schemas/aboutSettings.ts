const aboutSettings = {
  name: 'aboutSettings',
  title: 'About Page Settings',
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
      name: 'storyImage',
      title: 'Our Story Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image beside the "Discover our story" split section.',
    },
    {
      name: 'teamPhoto',
      title: 'Team Photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-width team group photo. Recommended aspect ratio 16:7.',
    },
    {
      name: 'recognitionImages',
      title: 'Recognition & Award Images',
      type: 'array',
      description: 'Images displayed in the rotating carousel in the Partnership & Recognition section. Add multiple award badges here.',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
  ],
}

export default aboutSettings